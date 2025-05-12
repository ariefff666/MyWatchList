<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache; // Untuk caching hasil API
use App\Models\Film; // Untuk menyimpan/update film lokal

class OmdbController extends Controller
{
    protected $apiKey;

    public function __construct()
    {
        $this->apiKey = env('OMDB_API_KEY');
        if (!$this->apiKey) {
            // Handle kasus API key tidak diset, mungkin throw exception atau log error
            // Untuk sekarang, controller akan gagal jika key tidak ada
        }
    }

    public function search(Request $request)
    {
        $validated = $request->validate([
            'query' => 'required|string|min:2',
            'type' => 'nullable|string|in:movie,series,episode', // Validasi tipe
            'year' => 'nullable|digits:4', // Validasi tahun
            'page' => 'nullable|integer|min:1',
        ]);

        $cacheKey = 'omdb_search_' . md5(http_build_query($validated));
        $cacheDuration = now()->addMinutes(60); // Cache selama 1 jam

        $results = Cache::remember($cacheKey, $cacheDuration, function () use ($validated) {
            $params = [
                'apikey' => $this->apiKey,
                's' => $validated['query'],
            ];
            if (!empty($validated['type'])) $params['type'] = $validated['type'];
            if (!empty($validated['year'])) $params['y'] = $validated['year'];
            if (!empty($validated['page'])) $params['page'] = $validated['page'];

            $response = Http::get("http://www.omdbapi.com/", $params);

            if ($response->successful() && isset($response->json()['Search'])) {
                return $response->json(); // Mengembalikan seluruh respons OMDb (Search, totalResults, Response)
            }
            return ['Search' => [], 'totalResults' => '0', 'Response' => 'False', 'Error' => $response->json()['Error'] ?? 'Unknown error'];
        });
        
        // Jika hanya butuh array Search
        // return response()->json($results['Search'] ?? []);
        return response()->json($results);
    }

    public function getFilmDetail(Request $request, $imdbId)
    {
        if (empty($this->apiKey)) {
            return response()->json(['Error' => 'OMDb API key not configured.'], 500);
        }
        
        $cacheKey = 'omdb_detail_' . $imdbId;
        $cacheDuration = now()->addHours(24); // Cache detail film selama 24 jam

        $filmData = Cache::remember($cacheKey, $cacheDuration, function () use ($imdbId) {
            $response = Http::get("http://www.omdbapi.com/", [
                'apikey' => $this->apiKey,
                'i' => $imdbId,
                'plot' => 'full' // 'short' atau 'full'
            ]);

            if ($response->successful() && $response->json()['Response'] == 'True') {
                $data = $response->json();
                // Simpan atau update film di database lokal
                Film::updateOrCreate(
                    ['imdb_id' => $data['imdbID']],
                    [
                        'title' => $data['Title'],
                        'year' => $data['Year'],
                        'type' => $data['Type'],
                        'poster_url' => $data['Poster'] === 'N/A' ? null : $data['Poster'],
                        'plot_short' => $data['Plot'] === 'N/A' ? null : ($data['Plot'] ? substr($data['Plot'],0,250).'...' : null), // Ambil plot pendek jika plot full
                        'plot_full' => $data['Plot'] === 'N/A' ? null : $data['Plot'],
                        'genre' => $data['Genre'] === 'N/A' ? null : $data['Genre'],
                        'director' => $data['Director'] === 'N/A' ? null : $data['Director'],
                        'actors' => $data['Actors'] === 'N/A' ? null : $data['Actors'],
                        'runtime' => $data['Runtime'] === 'N/A' ? null : $data['Runtime'],
                        'imdb_rating' => $data['imdbRating'] === 'N/A' ? null : $data['imdbRating'],
                        'metascore' => $data['Metascore'] === 'N/A' ? null : $data['Metascore'],
                        'other_ratings' => $data['Ratings'] ?? null,
                        'details_fetched_at' => now(),
                    ]
                );
                return $data;
            }
            return ['Response' => 'False', 'Error' => $response->json()['Error'] ?? 'Film not found or API error.'];
        });

        if ($filmData['Response'] == 'True') {
            return response()->json($filmData);
        }
        return response()->json(['Error' => $filmData['Error'] ?? 'Film not found.'], 404);
    }
}