<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Playlist; // Import Playlist

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        // Ambil playlist user dengan jumlah film di dalamnya dan beberapa film sebagai preview
        $playlists = $user->playlists()
            ->withCount('films')
            ->with(['films' => function ($query) {
                $query->select('films.id', 'films.imdb_id', 'films.title', 'films.poster_url')->limit(4);
            }])
            ->orderBy('name') // Order by name
            ->get()
            ->map(function ($playlist) { // Map untuk menambahkan data yang dibutuhkan frontend
                return [
                    'id' => $playlist->id,
                    'name' => $playlist->name,
                    'description' => $playlist->description,
                    'films_count' => $playlist->films_count,
                    'film_previews' => $playlist->films->map(fn($film) => [
                        'id' => $film->id, // ID internal film
                        'imdb_id' => $film->imdb_id,
                        'title' => $film->title,
                        'poster_url' => $film->poster_url,
                    ])->toArray(),
                    'updated_at_formatted' => $playlist->updated_at->diffForHumans(),
                ];
            });

        // Ambil semua playlist user hanya dengan ID dan nama untuk modal "Tambah ke Playlist"
        $userPlaylistsForModal = $user->playlists()->select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Dashboard', [
            'initialPlaylists' => $playlists,
            'userPlaylistsForModal' => $userPlaylistsForModal,
        ]);
    }
}