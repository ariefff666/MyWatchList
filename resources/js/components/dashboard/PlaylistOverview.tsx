import { Playlist } from '@/types';
import { PlusIcon } from '@heroicons/react/24/solid';
import React from 'react';
import PlaylistCard from '../common/PlaylistCard';

interface PlaylistOverviewProps {
    playlists: Playlist[];
    onViewPlaylist: (playlistId: number) => void;
    onCreateNewPlaylist: () => void;
}

const PlaylistOverview: React.FC<PlaylistOverviewProps> = ({ playlists, onViewPlaylist, onCreateNewPlaylist }) => {
    return (
        <div className="p-0 md:p-2">
            {' '}
            {/* Kurangi padding jika sudah ada di Dashboard.tsx */}
            <div className="mb-6 flex flex-col items-center justify-between px-1 sm:flex-row md:mb-8">
                <h1 className="mb-4 text-2xl font-bold text-white sm:mb-0 md:text-3xl">Semua Playlist Saya</h1>
                <button
                    onClick={onCreateNewPlaylist}
                    className="flex w-full transform items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:bg-blue-700 sm:w-auto"
                >
                    <PlusIcon className="mr-2 h-5 w-5" />
                    Buat Playlist Baru
                </button>
            </div>
            {playlists.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {playlists.map((playlist) => (
                        <PlaylistCard key={playlist.id} playlist={playlist} onViewPlaylist={onViewPlaylist} />
                    ))}
                </div>
            ) : (
                <div className="rounded-lg bg-gray-800 py-16 text-center shadow-xl md:py-20">
                    {/* Ganti dengan ikon yang lebih menarik jika ada, misal ikon folder kosong atau film strip */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.0}
                        stroke="currentColor"
                        className="mx-auto mb-4 h-20 w-20 text-gray-600 md:h-24 md:w-24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.393-.03.79-.03 1.184 0 1.13.094 1.976 1.057 1.976 2.192V7.5M8.25 7.5h7.5M8.25 7.5V9c0 .531-.213 1.014-.57 1.379l-2.8 2.813c-.303.303-.427.71-.427 1.121V16.5M16.5 7.5V9c0 .531.213 1.014.57 1.379l2.8 2.813c.303.303.427.71.427 1.121V16.5M6 16.5h12M6 16.5H4.875c-.621 0-1.125-.504-1.125-1.125V11.25c0-.621.504-1.125 1.125-1.125H6M18 16.5h1.125c.621 0 1.125-.504 1.125-1.125V11.25c0-.621-.504-1.125-1.125-1.125H18"
                        />
                    </svg>
                    <h2 className="mb-2 text-xl font-semibold text-white md:text-2xl">Belum Ada Playlist</h2>
                    <p className="mx-auto mb-6 max-w-md px-4 text-gray-400">
                        Mulai susun koleksi film, serial TV, atau anime favoritmu dengan membuat playlist pertamamu!
                    </p>
                    <button
                        onClick={onCreateNewPlaylist}
                        className="transform rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:bg-blue-700"
                    >
                        Buat Playlist Pertamamu
                    </button>
                </div>
            )}
        </div>
    );
};

export default PlaylistOverview;
