<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Playlist extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'description',
    ];

    /**
     * Mendapatkan user pemilik playlist.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Film-film yang ada di dalam playlist ini.
     */
    public function films(): BelongsToMany
    {
        return $this->belongsToMany(Film::class, 'film_playlist', 'playlist_id', 'film_id')
                    ->withPivot('added_at') // Mengambil kolom 'added_at' dari tabel pivot
                    ->withTimestamps(); // Mengelola created_at/updated_at di tabel pivot
    }
}