<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('film_playlist', function (Blueprint $table) {
            $table->id();
            $table->foreignId('film_id')->constrained('films')->onDelete('cascade'); // Relasi ke tabel films
            $table->foreignId('playlist_id')->constrained('playlists')->onDelete('cascade'); // Relasi ke tabel playlists
            $table->timestamp('added_at')->useCurrent(); // Kapan film ditambahkan ke playlist
            $table->timestamps();

            // Pastikan setiap film hanya bisa ditambahkan sekali ke playlist yang sama
            $table->unique(['film_id', 'playlist_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('film_playlist');
    }
};
