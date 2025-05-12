<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http; // HTTP Client Laravel
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
// Models jika Anda menyimpan data film di DB Anda
// use App\Models\Film;

class FilmController extends Controller
{
    private $omdbApiKey;

    public function __construct()
    {
        $this->omdbApiKey = env('OMDB_API_KEY');
    }

    // Untuk mencari film dari OMDb API
    public function search(Request $request)
    {
        $request->validate(['query' => 'required|string|min:2']);
        $searchTerm = $request->input('query');

        $response = Http::get("http://www.omdbapi.com/", [
            'apikey' => $this->omdbApiKey,
            's' => $searchTerm, // 's' untuk search multiple
            'type' => 'movie' // Bisa juga 'series', 'episode' atau hilangkan untuk semua
        ]);

        if ($response->successful() && isset($response->json()['Search'])) {
            return response()->json($response->json()['Search']);
        }
        return response()->json(['error' => 'Film tidak ditemukan atau terjadi kesalahan.'], 404);
    }

    // Untuk mendapatkan detail film spesifik dari OMDb API berdasarkan ID IMDb
    public function getDetail(Request $request, $imdbId)
    {
         // Validasi $imdbId jika perlu (misal formatnya)
        if (empty($imdbId)) {
            return response()->json(['error' => 'ID IMDb tidak valid.'], 400);
        }

        $response = Http::get("http://www.omdbapi.com/", [
            'apikey' => $this->omdbApiKey,
            'i' => $imdbId,    // 'i' untuk ID IMDb
            'plot' => 'full'  // 'short' atau 'full' plot
        ]);

        if ($response->successful() && $response->json()['Response'] == 'True') {
            // Di sini Anda bisa memilih untuk menyimpan film ini ke DB Anda jika belum ada
            // atau langsung mengembalikannya.
            return response()->json($response->json());
        }
        return response()->json(['error' => 'Detail film tidak ditemukan.'], 404);
    }

    // Untuk menampilkan halaman detail film (page baru)
    public function showDetailView($imdbId)
    {
        // Mirip dengan getDetail, tapi merender view Inertia
        $response = Http::get("http://www.omdbapi.com/", [
            'apikey' => $this->omdbApiKey,
            'i' => $imdbId,
            'plot' => 'full'
        ]);

        if ($response->successful() && $response->json()['Response'] == 'True') {
            $filmData = $response->json();
            // Anda mungkin ingin mengambil data playlist user juga di sini
            // untuk opsi "tambahkan ke playlist"

            /** @var \App\Models\User $user */
            $user = Auth::user();

            $userPlaylists = $user->playlists()->get(['id', 'name']); // Ambil playlist user

            return Inertia::render('FilmDetail', [
                'film' => $filmData,
                'userPlaylists' => $userPlaylists,
                // Anda juga bisa menambahkan rating user untuk film ini jika ada
            ]);
        }
        // Handle error, mungkin redirect ke halaman 404 atau dashboard dengan pesan error
        return redirect()->route('dashboard')->with('error', 'Detail film tidak ditemukan.');
    }
}