<?php

namespace App\Http\Controllers;

use App\Models\Playlist;
use App\Models\Film;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http; // Untuk OMDb jika perlu fetch detail di sini
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia; // Jika ada halaman khusus playlist

class PlaylistController extends Controller
{
    
    use AuthorizesRequests;
    protected $omdbApiKey;

    public function __construct()
    {
        $this->omdbApiKey = env('OMDB_API_KEY');
    }

    // API untuk mengambil semua playlist user (digunakan di Dashboard atau Sidebar)
    public function index(Request $request)
    {
        $user = $request->user();
        $playlists = $user->playlists()
            ->withCount('films')
            ->orderBy('name')
            ->get()
            ->map(function ($playlist) {
                 // Ambil beberapa poster film untuk preview di sidebar jika perlu
                $filmPreviews = $playlist->films()->take(4)->pluck('poster_url');
                return [
                    'id' => $playlist->id,
                    'name' => $playlist->name,
                    'description' => $playlist->description,
                    'films_count' => $playlist->films_count,
                    'film_poster_previews' => $filmPreviews, // Array URL poster
                    // Anda bisa menambahkan data film lengkap jika frontend membutuhkan
                    // 'films' => $playlist->films()->with('userRatings', fn($q) => $q->where('user_id', auth()->id()))->get(),
                ];
            });

        return response()->json($playlists);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('playlists')->where(function ($query) {
                return $query->where('user_id', Auth::id());
            })],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        $playlist = $user->playlists()->create($validated);

        return response()->json([
            'message' => 'Playlist berhasil dibuat.',
            'playlist' => [
                'id' => $playlist->id,
                'name' => $playlist->name,
                'description' => $playlist->description,
                'films_count' => 0,
                'film_poster_previews' => [],
                'films' => [],
            ]
        ], 201);
    }

    public function update(Request $request, Playlist $playlist)
    {
        // Pastikan user yang login adalah pemilik playlist
        $this->authorize('update', $playlist); // Perlu membuat Policy: PlaylistPolicy

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('playlists')->where(function ($query) use ($playlist) {
                return $query->where('user_id', Auth::id())->where('id', '!=', $playlist->id);
            })],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $playlist->update($validated);

        return response()->json([
            'message' => 'Playlist berhasil diperbarui.',
            'playlist' => $playlist->loadCount('films') // Muat ulang data yang mungkin berubah
        ]);
    }

    public function destroy(Playlist $playlist)
    {
        $this->authorize('delete', $playlist); // Perlu membuat Policy: PlaylistPolicy
        $playlistName = $playlist->name;
        $playlist->delete(); // Ini juga akan menghapus relasi di film_playlist karena onDelete('cascade')

        return response()->json(['message' => "Playlist '{$playlistName}' berhasil dihapus."]);
    }

    public function addFilm(Request $request, Playlist $playlist)
    {
        $this->authorize('update', $playlist); // User harus bisa update playlist untuk menambah film

        $validated = $request->validate([
            'imdb_id' => 'required|string',
            // Data film lain bisa opsional, karena kita bisa fetch dari OMDb jika belum ada
            'title' => 'sometimes|string|max:255',
            'year' => 'sometimes|string|max:10',
            'poster_url' => 'sometimes|nullable|url',
            'type' => 'sometimes|string|max:50',
            // Tambahkan validasi lain jika perlu
        ]);

        // Cari atau buat film di database lokal
        $film = Film::firstWhere('imdb_id', $validated['imdb_id']);

        if (!$film) {
            // Jika film belum ada di DB lokal, fetch detail dari OMDb (atau gunakan data dari request jika cukup)
            $omdbResponse = Http::get("http://www.omdbapi.com/", [
                'apikey' => $this->omdbApiKey,
                'i' => $validated['imdb_id'],
                'plot' => 'short' // atau 'full'
            ]);

            if ($omdbResponse->successful() && $omdbResponse->json()['Response'] == 'True') {
                $omdbData = $omdbResponse->json();
                $film = Film::create([
                    'imdb_id' => $omdbData['imdbID'],
                    'title' => $omdbData['Title'],
                    'year' => $omdbData['Year'],
                    'type' => $omdbData['Type'],
                    'poster_url' => $omdbData['Poster'] === 'N/A' ? null : $omdbData['Poster'],
                    'plot_short' => $omdbData['Plot'] === 'N/A' ? null : $omdbData['Plot'],
                    'genre' => $omdbData['Genre'] === 'N/A' ? null : $omdbData['Genre'],
                    'director' => $omdbData['Director'] === 'N/A' ? null : $omdbData['Director'],
                    'actors' => $omdbData['Actors'] === 'N/A' ? null : $omdbData['Actors'],
                    'runtime' => $omdbData['Runtime'] === 'N/A' ? null : $omdbData['Runtime'],
                    'imdb_rating' => $omdbData['imdbRating'] === 'N/A' ? null : $omdbData['imdbRating'],
                    'metascore' => $omdbData['Metascore'] === 'N/A' ? null : $omdbData['Metascore'],
                    'other_ratings' => $omdbData['Ratings'] ?? null,
                    'details_fetched_at' => now(),
                ]);
            } else {
                // Jika OMDb gagal dan data dari request minimal, gunakan data request
                // atau kembalikan error jika data tidak cukup
                if (isset($validated['title'])) {
                     $film = Film::create([
                        'imdb_id' => $validated['imdb_id'],
                        'title' => $validated['title'],
                        'year' => $validated['year'] ?? null,
                        'poster_url' => $validated['poster_url'] ?? null,
                        'type' => $validated['type'] ?? null,
                        'details_fetched_at' => null, // Tandai bahwa detail lengkap belum diambil
                    ]);
                } else {
                    return response()->json(['message' => 'Gagal mendapatkan detail film dari OMDb.'], 404);
                }
            }
        } elseif ($film && (is_null($film->details_fetched_at) || $film->details_fetched_at->diffInMonths(now()) > 1)) {
            // Opsional: Update detail film jika sudah lama tidak di-fetch
            // Logika update mirip dengan fetch di atas
        }


        // Tambahkan film ke playlist jika belum ada
        if (!$playlist->films()->where('film_id', $film->id)->exists()) {
            $playlist->films()->attach($film->id, ['added_at' => now()]);
            // Muat rating user untuk film yang baru ditambahkan
            $film->load(['userRatings' => fn($q) => $q->where('user_id', Auth::id())]);
            return response()->json([
                'message' => "'{$film->title}' berhasil ditambahkan ke playlist '{$playlist->name}'.",
                'film' => $film,
                'title' => $film->title,
            ], 201);
        }

        return response()->json(['message' => "'{$film->title}' sudah ada di playlist '{$playlist->name}'."], 200);
    }

    public function removeFilm(Request $request, Playlist $playlist, Film $film)
    {
        // Film $film di sini adalah instance yang di-resolve berdasarkan ID internal film kita
        $this->authorize('delete', $playlist); // User harus bisa update playlist untuk menghapus film

        if ($playlist->films()->detach($film->id)) {
            return response()->json(['message' => "'{$film->title}' berhasil dihapus dari playlist '{$playlist->name}'."]);
        }

        return response()->json(['message' => "Gagal menghapus '{$film->title}' dari playlist."], 500);
    }

    public function showPage(Request $request, Playlist $playlist)
    {
        // Pastikan user yang login adalah pemilik playlist
        $this->authorize('view', $playlist); // Menggunakan PlaylistPolicy

        $user = $request->user();

        // Load film dalam playlist beserta rating user yang login
        $playlist->load(['films' => function ($query) use ($user) {
            $query->orderBy('title')->with(['userRatings' => function ($q) use ($user) {
                $q->where('user_id', $user->id);
            }]);
        }]);

        $selectedPlaylistData = [
            'id' => $playlist->id,
            'name' => $playlist->name,
            'description' => $playlist->description,
            'films_count' => $playlist->films->count(),
            'films' => $playlist->films->map(function ($film) {
                $userRatingInstance = $film->userRatings->first();
                return [
                    'id' => $film->id,
                    'imdb_id' => $film->imdb_id,
                    'title' => $film->title,
                    'year' => $film->year,
                    'type' => $film->type,
                    'poster_url' => $film->poster_url,
                    'plot_short' => $film->plot_short,
                    // ... field film lainnya yang relevan untuk FilmCard
                    'current_user_rating' => $userRatingInstance ? $userRatingInstance->rating : null,
                    'pivot' => $film->pivot,
                ];
            })->toArray(),
            'created_at' => $playlist->created_at->toDateTimeString(),
            'updated_at' => $playlist->updated_at->toDateTimeString(),
            'updated_at_formatted' => $playlist->updated_at->diffForHumans(),
        ];

        // Ambil semua playlist user untuk sidebar dan modal "Tambah ke Playlist" di overview film
        $allUserPlaylists = $user->playlists()
            ->withCount('films')
            ->orderBy('name')
            ->get()
            ->map(function ($pl_item) {
                return [
                    'id' => $pl_item->id,
                    'name' => $pl_item->name,
                    'description' => $pl_item->description,
                    'films_count' => $pl_item->films_count,
                        // Tidak perlu film_previews di sini jika tidak ditampilkan di halaman ini
                ];
            });

        $userPlaylistsForModal = $user->playlists()->select('id', 'name')->orderBy('name')->get();


        // Kita akan tetap merender 'Dashboard' tapi dengan prop yang berbeda
        return Inertia::render('dashboard', [
            'initialPlaylists' => $allUserPlaylists, // Untuk PlaylistOverview jika user kembali
            'userPlaylistsForModal' => $userPlaylistsForModal,
            'selectedPlaylistDataFromController' => $selectedPlaylistData, // Data playlist yang dipilih
            'showCreatePlaylistModalFromUrl' => false, // Tidak relevan di sini
        ]);
    }
}