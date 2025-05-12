import { getFilmDetails } from '@/lib/omdb-api';
import { useEffect, useState } from 'react';

interface Props {
    imdbID: string;
}

export default function FilmDetailView({ imdbID }: Props) {
    const [movie, setMovie] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getFilmDetails(imdbID)
            .then(setMovie)
            .catch((err) => setError(err.message));
    }, [imdbID]);

    if (error) return <p>Error: {error}</p>;
    if (!movie) return <p>Loading...</p>;
    return (
        <div className="p-4">
            <h1 className="mb-4 text-2xl font-bold">{movie.Title}</h1>
            <div className="flex gap-4">
                <img src={movie.Poster} alt={movie.Title} className="w-48" />
                <div>
                    <p>
                        <strong>Year:</strong> {movie.Year}
                    </p>
                    <p>
                        <strong>Genre:</strong> {movie.Genre}
                    </p>
                    <p>
                        <strong>Director:</strong> {movie.Director}
                    </p>
                    <p>
                        <strong>Actors:</strong> {movie.Actors}
                    </p>
                    <p>
                        <strong>Plot:</strong> {movie.Plot}
                    </p>
                    <p>
                        <strong>IMDB Rating:</strong> {movie.imdbRating}
                    </p>
                </div>
            </div>
        </div>
    );
}
