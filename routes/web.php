<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use App\Http\Controllers\FilmController;
use App\Http\Controllers\PlaylistController;
use App\Http\Controllers\OmdbController;
use App\Http\Controllers\UserRatingController;
use App\Http\Controllers\FilmPageController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;

Route::get('/', function () {
    if (Auth::check()) {
        return Inertia::render('dashboard');
    }
    return Inertia::render('welcome', [ // Halaman Welcome dari Breeze
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('welcome');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Profil Pengguna (Breeze)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Playlist
    Route::get('/api/playlists', [PlaylistController::class, 'index'])->name('api.playlists.index');
    Route::post('/api/playlists', [PlaylistController::class, 'store'])->name('api.playlists.store');
    Route::put('/api/playlists/{playlist}', [PlaylistController::class, 'update'])->name('api.playlists.update');
    Route::delete('/api/playlists/{playlist}', [PlaylistController::class, 'destroy'])->name('api.playlists.destroy');
    // Route::get('/api/playlists/{playlist}', [PlaylistController::class, 'show'])->name('api.playlists.show'); // Jika diperlukan

    // Film dalam Playlist
    Route::post('/api/playlists/{playlist}/films', [PlaylistController::class, 'addFilm'])->name('api.playlists.films.add');
    Route::delete('/api/playlists/{playlist}/films/{film}', [PlaylistController::class, 'removeFilm'])->name('api.playlists.films.remove');

    // OMDb API Proxy & Detail Film Lokal
    Route::get('/api/omdb/search', [OmdbController::class, 'search'])->name('api.omdb.search'); // q={searchTerm}
    Route::get('/api/omdb/films/{imdbId}', [OmdbController::class, 'getFilmDetail'])->name('api.omdb.film.detail');

    // Halaman Detail Film (Inertia Page)
    Route::get('/film/{imdbId}', [FilmPageController::class, 'show'])->name('film.show.page');

    Route::get('/playlist/{playlist}', [PlaylistController::class, 'showPage'])->name('playlist.show');

    // User Ratings
    Route::post('/api/films/{film}/rate', [UserRatingController::class, 'storeOrUpdate'])->name('api.films.rate'); // {film} adalah ID internal film
    // Route::get('/api/films/{film}/my-rating', [UserRatingController::class, 'show'])->name('api.films.my-rating'); // Opsional
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
