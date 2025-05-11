import { searchMovies } from '@/lib/omdb-api';
import { router } from '@inertiajs/react';
import { useState } from 'react';

const goToDetail = (imdbID: string) => {
    router.visit(`/movie/details/${imdbID}`);
};

export default function MovieTable() {
    const [query, setQuery] = useState('');
    const [movies, setMovies] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        setLoading(true);
        setError('');
        try {
            const results = await searchMovies(query);
            setMovies(results);
            if (results.length === 0) setError('Film tidak ditemukan.');
        } catch {
            setError('Terjadi kesalahan saat mengambil data.');
        }
        setLoading(false);
    };

    return (
        <div className="p-4">
            <h1 className="mb-4 text-xl font-bold">Search Movies</h1>

            <div className="mb-4 flex gap-2">
                <input
                    type="text"
                    placeholder="Cari film..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full rounded border p-2"
                />
                <button onClick={handleSearch} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                    Search
                </button>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p className="text-red-600">{error}</p>}

            {movies.length > 0 && (
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr>
                            <th className="border p-2">Poster</th>
                            <th className="border p-2">Title</th>
                            <th className="border p-2">Year</th>
                            <th className="border p-2">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {movies.map((movie) => (
                            <tr key={movie.imdbID}>
                                <td className="border p-2">
                                    <img src={movie.Poster} alt={movie.Title} width="50" />
                                </td>
                                <td className="border p-2">{movie.Title}</td>
                                <td className="border p-2">{movie.Year}</td>
                                <td className="border p-2">
                                    <button
                                        className="rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600"
                                        onClick={() => goToDetail(movie.imdbID)}
                                    >
                                        Lihat Detail
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
