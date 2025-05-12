import { ChevronRightIcon, FilmIcon } from '@heroicons/react/24/outline';
import React from 'react';
import Button from './Button';
import MoviePoster from './MoviePoster';

interface Movie {
    id: string;
    title: string;
    posterUrl: string;
    year?: string;
    imdbRating?: number;
    userRating?: number | null;
}

interface Playlist {
    id: string;
    name: string;
    movies: Movie[];
    description?: string;
}

interface PlaylistCardNewProps {
    playlist: Playlist;
}

const PlaylistCardNew: React.FC<PlaylistCardNewProps> = ({ playlist }) => {
    const displayedMovies = playlist.movies.slice(0, 5); // Tampilkan maks 5 poster

    return (
        <div className="overflow-hidden rounded-xl bg-slate-800 shadow-xl transition-all duration-300 hover:shadow-sky-500/20">
            <div className="p-5 md:p-6">
                <div className="mb-3 flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white transition-colors group-hover:text-sky-400 md:text-2xl">{playlist.name}</h2>
                        {playlist.description && <p className="mt-1 line-clamp-2 text-sm text-slate-400">{playlist.description}</p>}
                    </div>
                    <Button variant="ghost" size="sm" className="ml-2 flex-shrink-0">
                        Lihat Semua <ChevronRightIcon className="ml-1 h-4 w-4" />
                    </Button>
                </div>

                {displayedMovies.length > 0 ? (
                    <div className="scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800 -mb-3 flex space-x-3 overflow-x-auto pb-3 md:space-x-4">
                        {/* Horizontal scroll untuk poster film */}
                        {displayedMovies.map((movie) => (
                            <MoviePoster key={movie.id} movie={movie} size="small" />
                        ))}
                        {playlist.movies.length > displayedMovies.length && (
                            <div className="flex w-28 flex-shrink-0 cursor-pointer items-center justify-center rounded-lg bg-slate-700/50 text-slate-400 hover:bg-slate-700 md:w-32 lg:w-36">
                                <div className="text-center">
                                    <ChevronRightIcon className="mx-auto mb-1 h-8 w-8" />
                                    <span className="text-xs">Lihat {playlist.movies.length - displayedMovies.length} lainnya</span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex h-40 flex-col items-center justify-center rounded-lg bg-slate-700/30 p-4 text-center">
                        <FilmIcon className="mb-2 h-12 w-12 text-slate-500" />
                        <p className="text-slate-400">Playlist ini masih kosong.</p>
                        <Button variant="primary" size="sm" className="mt-3">
                            Tambah Film
                        </Button>
                    </div>
                )}
            </div>
            <div className="flex items-center justify-between border-t border-slate-700/50 bg-slate-800/50 px-5 py-3 md:px-6 md:py-4">
                <p className="text-sm text-slate-400">{playlist.movies.length} item</p>
                <div>
                    {/* Tombol aksi lain untuk playlist, misal Edit, Hapus */}
                    <Button variant="ghost" size="sm" className="mr-2">
                        Edit
                    </Button>
                    <Button variant="danger" size="sm">
                        Hapus
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PlaylistCardNew;
