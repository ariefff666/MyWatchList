<?php

namespace App\Http\Controllers;

use App\Models\Film;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http; // Untuk fallback ke OMDb jika film tidak ada di DB lokal

class FilmPageController extends Controller
{
    protected $omdbApiKey;

    public function __construct()
    {
        $this->omdbApiKey = env('OMDB_API_KEY');
    }

    public function show($imdbId) // Menerima imdb_id dari route
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $film = Film::where('imdb_id', $imdbId)->first();
        $userRating = null;
        $omdbFilmData = null;

        if ($film) {
            // Film ditemukan di DB lokal, ambil rating user
            $ratingInstance = $film->userRatings()->where('user_id', $user->id)->first();
            $userRating = $ratingInstance ? $ratingInstance->rating : null;

            // Jadikan data film kompatibel dengan struktur OMDbFilmDetail jika perlu
            // atau frontend bisa handle kedua struktur
            $omdbFilmData = [ // Ini adalah konversi manual, sesuaikan fieldnya
                'imdbID' => $film->imdb_id,
                'Title' => $film->title,
                'Year' => $film->year,
                'Type' => $film->type,
                'Poster' => $film->poster_url,
                'Plot' => $film->plot_full ?? $film->plot_short,
                'Genre' => $film->genre,
                'Director' => $film->director,
                'Actors' => $film->actors,
                'Runtime' => $film->runtime,
                'imdbRating' => $film->imdb_rating,
                'Metascore' => $film->metascore,
                'Ratings' => $film->other_ratings, // Asumsi ini sudah array of objects
                'Response' => 'True',
                // Tambahkan field lain yang ada di OMDbFilmDetail jika perlu
                'Rated' => $film->rated ?? 'N/A', // Anda mungkin perlu menambahkan field 'rated' ke tabel films
                'Released' => $film->released_date ?? 'N/A', // dan 'released_date'
                'Language' => $film->language ?? 'N/A',
                'Country' => $film->country ?? 'N/A',
                'Awards' => $film->awards ?? 'N/A',
            ];

        } else {
            // Film tidak ada di DB lokal, coba fetch dari OMDb
            $response = Http::get("http://www.omdbapi.com/", [
                'apikey' => $this->omdbApiKey,
                'i' => $imdbId,
                'plot' => 'full'
            ]);

            if ($response->successful() && $response->json()['Response'] == 'True') {
                $omdbFilmData = $response->json();
                // Opsional: Simpan film ini ke DB lokal sekarang
                Film::updateOrCreate(
                    ['imdb_id' => $omdbFilmData['imdbID']],
                    [
                        'title' => $omdbFilmData['Title'],
                        'year' => $omdbFilmData['Year'],
                        'type' => $omdbFilmData['Type'],
                        'poster_url' => $omdbFilmData['Poster'] === 'N/A' ? null : $omdbFilmData['Poster'],
                        'plot_short' => $omdbFilmData['Plot'] === 'N/A' ? null : (strlen($omdbFilmData['Plot']) > 250 ? substr($omdbFilmData['Plot'],0,250).'...' : $omdbFilmData['Plot']),
                        'plot_full' => $omdbFilmData['Plot'] === 'N/A' ? null : $omdbFilmData['Plot'],
                        'genre' => $omdbFilmData['Genre'] === 'N/A' ? null : $omdbFilmData['Genre'],
                        'director' => $omdbFilmData['Director'] === 'N/A' ? null : $omdbFilmData['Director'],
                        'actors' => $omdbFilmData['Actors'] === 'N/A' ? null : $omdbFilmData['Actors'],
                        'runtime' => $omdbFilmData['Runtime'] === 'N/A' ? null : $omdbFilmData['Runtime'],
                        'imdb_rating' => $omdbFilmData['imdbRating'] === 'N/A' ? null : $omdbFilmData['imdbRating'],
                        'metascore' => $omdbFilmData['Metascore'] === 'N/A' ? null : $omdbFilmData['Metascore'],
                        'other_ratings' => $omdbFilmData['Ratings'] ?? null,
                        'details_fetched_at' => now(),
                    ]
                );
                // Karena film baru, user rating pasti null
                $userRating = null;
            } else {
                // Film tidak ditemukan sama sekali
                return Inertia::render('FilmDetail', [
                    'film' => null, // Atau kirim objek error
                    'error' => $response->json()['Error'] ?? 'Film tidak ditemukan.',
                    'userPlaylists' => [],
                    'userRatingForThisFilm' => null,
                ])->withViewData(['title' => 'Film Tidak Ditemukan']);
            }
        }

        $userPlaylists = $user->playlists()->select('id', 'name')->orderBy('name')->get();

        return Inertia::render('FilmDetail', [
            'film' => $omdbFilmData, // Kirim data yang konsisten (struktur OMDb)
            'userPlaylists' => $userPlaylists,
            'userRatingForThisFilm' => $userRating, // Rating 1-10
        ])->withViewData(['title' => $omdbFilmData ? 'Detail: ' . $omdbFilmData['Title'] : 'Detail Film']);
    }
}