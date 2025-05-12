import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import React from 'react';

interface Movie {
    id: string;
    title: string;
    posterUrl: string;
    year?: string;
    imdbRating?: number;
    userRating?: number | null;
}

interface MoviePosterProps {
    movie: Movie;
    size?: 'small' | 'medium';
}

const MoviePoster: React.FC<MoviePosterProps> = ({ movie, size = 'medium' }) => {
    const sizeClasses =
        size === 'small'
            ? 'w-28 md:w-32 lg:w-36' // Ukuran lebih kecil untuk preview di dalam card playlist
            : 'w-40 md:w-48 lg:w-52'; // Ukuran standar

    return (
        <div
            className={`group relative ${sizeClasses} flex-shrink-0 transform cursor-pointer overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-sky-500/30`}
        >
            <img src={movie.posterUrl} alt={`Poster ${movie.title}`} className="aspect-[2/3] h-auto w-full object-cover" />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <h3 className={`font-semibold text-white ${size === 'small' ? 'text-xs' : 'text-sm md:text-base'} leading-tight`}>{movie.title}</h3>
                {movie.year && <p className="text-xs text-slate-300">{movie.year}</p>}
                <div className="mt-1 flex items-center">
                    {movie.imdbRating && (
                        <div className="mr-2 flex items-center">
                            <StarSolid className="mr-0.5 h-3 w-3 text-yellow-400" />
                            <span className="text-xs text-yellow-400">{movie.imdbRating.toFixed(1)}</span>
                        </div>
                    )}
                    {movie.userRating !== undefined && movie.userRating !== null && (
                        <div className="flex items-center">
                            <StarSolid className="mr-0.5 h-3 w-3 text-sky-400" />
                            <span className="text-xs text-sky-400">{movie.userRating}/5</span>
                        </div>
                    )}
                </div>
            </div>
            {/* Indikator Rating User di pojok (jika ada) */}
            {movie.userRating && (
                <div className="absolute top-2 right-2 flex items-center rounded-full bg-sky-500 px-1.5 py-0.5 text-xs font-bold text-white">
                    <StarSolid className="mr-0.5 h-3 w-3" /> {movie.userRating}
                </div>
            )}
        </div>
    );
};

export default MoviePoster;
