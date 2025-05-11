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
        Schema::create('films', function (Blueprint $table) {
            $table->id(); // ID internal aplikasi
            $table->string('imdb_id')->unique(); // ID dari IMDb, untuk sinkronisasi dan referensi global
            $table->string('title');
            $table->string('year')->nullable();
            $table->string('type')->nullable()->comment('Contoh: movie, series, episode'); // Tipe dari OMDb
            $table->text('poster_url')->nullable();
            $table->text('plot_short')->nullable()->comment('Sinopsis pendek');
            $table->text('plot_full')->nullable()->comment('Sinopsis lengkap');
            $table->string('genre')->nullable()->comment('Contoh: Action, Drama, Sci-Fi');
            $table->string('director')->nullable();
            $table->text('actors')->nullable();
            $table->string('runtime')->nullable();
            $table->string('imdb_rating')->nullable()->comment('Rating dari IMDb, contoh: "8.8"');
            $table->string('metascore')->nullable();
            $table->json('other_ratings')->nullable()->comment('Simpan rating lain seperti Rotten Tomatoes jika ada');
            $table->timestamp('details_fetched_at')->nullable()->comment('Kapan detail terakhir diambil dari OMDb');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('films');
    }
};
