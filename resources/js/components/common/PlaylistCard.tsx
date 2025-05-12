import { Playlist } from '@/types';
import { ArrowRightIcon, FilmIcon } from '@heroicons/react/24/outline'; // Menggunakan ikon yang lebih relevan
import React from 'react';

interface PlaylistCardProps {
    playlist: Playlist; // Menggunakan film_previews atau film_poster_previews
    onViewPlaylist: (playlistId: number) => void;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onViewPlaylist }) => {
    // Menggunakan film_poster_previews jika ada, atau film_previews
    const posterUrls = playlist.film_poster_previews || (playlist.film_previews?.map((f) => f.poster_url).filter(Boolean) as string[]) || [];
    const previewPosters = posterUrls.slice(0, 4);

    return (
        <div
            className="group flex h-full cursor-pointer flex-col rounded-xl bg-gray-800 p-5 shadow-xl transition-all duration-300 hover:ring-1 hover:shadow-blue-500/30 hover:ring-blue-500 md:p-6"
            onClick={() => onViewPlaylist(playlist.id)}
        >
            <h3 className="mb-1 truncate text-xl font-semibold text-white transition-colors group-hover:text-blue-400" title={playlist.name}>
                {playlist.name}
            </h3>
            <p className="mb-3 text-xs text-gray-500">Diperbarui {playlist.updated_at_formatted || 'baru saja'}</p>
            <p className="mb-4 line-clamp-2 min-h-[40px] flex-grow text-sm text-gray-400">
                {playlist.description || `${playlist.films_count || 0} item${(playlist.films_count || 0) !== 1 ? 's' : ''}`}
            </p>

            {/* Miniatur poster */}
            {previewPosters.length > 0 ? (
                <div
                    className={`grid ${previewPosters.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} mb-4 h-32 gap-1 overflow-hidden rounded-md bg-gray-700 md:h-36`}
                >
                    {previewPosters.map((posterUrl, index) => (
                        <img
                            key={index}
                            src={posterUrl || 'https://via.placeholder.com/150x220/374151/9CA3AF?text=N/A'} // Fallback jika URL null
                            alt={`Poster ${index + 1}`}
                            className="h-full w-full object-cover"
                            onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150x220/374151/9CA3AF?text=Error')}
                        />
                    ))}
                </div>
            ) : (
                <div className="mb-4 flex h-32 flex-col items-center justify-center rounded-md bg-gray-700/50 text-gray-500 md:h-36">
                    <FilmIcon className="mb-1 h-12 w-12 text-gray-600" />
                    <span className="text-xs">Playlist Kosong</span>
                </div>
            )}

            <div className="mt-auto flex items-center justify-between border-t border-gray-700 pt-3">
                <span className="text-xs text-gray-500">{playlist.films_count || 0} Tontonan</span>
                <div className="flex items-center text-sm font-semibold text-blue-400 hover:text-blue-300">
                    Lihat Detail <ArrowRightIcon className="ml-1 h-4 w-4" />
                </div>
            </div>
        </div>
    );
};

export default PlaylistCard;
