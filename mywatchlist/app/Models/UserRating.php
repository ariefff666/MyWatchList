<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserRating extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'film_id',
        'rating',
    ];

    protected $table = 'user_ratings'; // Eksplisit jika nama tabel berbeda dari konvensi

    /**
     * Mendapatkan user yang memberikan rating.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Mendapatkan film yang dirating.
     */
    public function film(): BelongsTo
    {
        return $this->belongsTo(Film::class);
    }
}