<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Auth;

class Film extends Model
{
    use HasFactory;

    protected $fillable = [
        'imdb_id',
        'title',
        'year',
        'type',
        'poster_url',
        'plot_short',
        'plot_full',
        'genre',
        'director',
        'actors',
        'runtime',
        'imdb_rating',
        'metascore',
        'other_ratings',
        'details_fetched_at',
    ];

    protected $casts = [
        'other_ratings' => 'array', // Otomatis cast JSON ke array dan sebaliknya
        'details_fetched_at' => 'datetime',
    ];

    /**
     * Playlist-playlist yang memuat film ini.
     */
    public function playlists(): BelongsToMany
    {
        return $this->belongsToMany(Playlist::class, 'film_playlist', 'film_id', 'playlist_id')
                    ->withPivot('added_at')
                    ->withTimestamps();
    }

    /**
     * Mendapatkan semua rating pengguna untuk film ini.
     */
    public function userRatings(): HasMany
    {
        return $this->hasMany(UserRating::class);
    }

    /**
     * Mendapatkan rating dari user yang sedang login untuk film ini.
     * Ini adalah accessor, bukan relasi langsung untuk query yang mudah.
     */
    public function getCurrentUserRatingAttribute()
    {
        if (Auth::check()) {
            $rating = $this->userRatings()->where('user_id', Auth::id())->first();
            return $rating ? $rating->rating : null;
        }
        return null;
    }

    /**
     * Tambahkan accessor ini ke $appends agar otomatis termuat saat model diserialisasi.
     */
    protected $appends = ['current_user_rating'];
}