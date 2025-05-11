<?php

namespace App\Http\Controllers;

use App\Models\Film; // Menggunakan model Film lokal
use App\Models\UserRating;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserRatingController extends Controller
{
    public function storeOrUpdate(Request $request, Film $film) // Menggunakan route model binding untuk Film (ID internal)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:0|max:10', // 0 untuk menghapus rating, 1-10 untuk memberi rating
        ]);

        $userId = Auth::id();

        if ($validated['rating'] == 0) {
            // Hapus rating jika rating adalah 0
            UserRating::where('user_id', $userId)->where('film_id', $film->id)->delete();
            return response()->json(['message' => 'Rating berhasil dihapus.', 'new_rating' => null]);
        } else {
            // Buat atau update rating
            $userRating = UserRating::updateOrCreate(
                ['user_id' => $userId, 'film_id' => $film->id],
                ['rating' => $validated['rating']]
            );
            return response()->json(['message' => 'Rating berhasil disimpan.', 'new_rating' => $userRating->rating]);
        }
    }

    // Opsional: Jika ingin mengambil rating spesifik via API
    public function show(Request $request, Film $film)
    {
        $userRating = UserRating::where('user_id', Auth::id())
                                ->where('film_id', $film->id)
                                ->first();

        return response()->json($userRating ? ['rating' => $userRating->rating] : ['rating' => null]);
    }
}