import { Film, Playlist } from '@/types';
import { ArrowUturnLeftIcon, PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/solid';
import { router } from '@inertiajs/react'; // Untuk tombol kembali
import axios from 'axios'; // Untuk edit/delete playlist
import { FilmIcon } from 'lucide-react';
import React, { useState } from 'react';
import FilmCard from '../common/FilmCard';

interface PlaylistDetailViewProps {
    playlist: Playlist; // Sekarang films adalah opsional, karena bisa jadi belum diload
    onOpenAddFilmModal: () => void;
    onFilmCardClick: (film: Film) => void;
    onRatingUpdated: (filmImdbId: string, newRating: number | null) => void;
    onFilmRemoved: (playlistId: number, filmDbId: number) => void;
    onPlaylistDetailsUpdated: (updatedPlaylist: Playlist) => void;
    onPlaylistDeleted: (deletedPlaylistId: number) => void;
}

const PlaylistDetailView: React.FC<PlaylistDetailViewProps> = ({
    playlist,
    onOpenAddFilmModal,
    onFilmCardClick,
    onRatingUpdated,
    onFilmRemoved,
    onPlaylistDetailsUpdated,
    onPlaylistDeleted,
}) => {
    const [isEditingPlaylist, setIsEditingPlaylist] = useState(false);
    const [editName, setEditName] = useState(playlist.name);
    const [editDescription, setEditDescription] = useState(playlist.description || '');

    const filmsToDisplay = playlist.films || []; // Handle jika films belum ada

    const handleBackToOverview = () => {
        router.visit(route('dashboard'), { preserveState: true, preserveScroll: true });
    };

    const handleSavePlaylistChanges = async () => {
        try {
            const response = await axios.put(route('api.playlists.update', { playlist: playlist.id }), {
                name: editName,
                description: editDescription,
            });
            onPlaylistDetailsUpdated(response.data.playlist);
            setIsEditingPlaylist(false);
            alert('Playlist berhasil diperbarui!');
        } catch (error: any) {
            console.error('Error updating playlist:', error);
            alert(error.response?.data?.message || 'Gagal memperbarui playlist.');
        }
    };

    const handleDeletePlaylist = async () => {
        if (window.confirm(`Anda yakin ingin menghapus playlist "${playlist.name}"? Aksi ini tidak dapat diurungkan.`)) {
            try {
                await axios.delete(route('api.playlists.destroy', { playlist: playlist.id }));
                onPlaylistDeleted(playlist.id);
                alert(`Playlist "${playlist.name}" berhasil dihapus.`);
                // Navigasi kembali ke overview akan dihandle oleh DashboardPage
            } catch (error: any) {
                console.error('Error deleting playlist:', error);
                alert(error.response?.data?.message || 'Gagal menghapus playlist.');
            }
        }
    };

    return (
        <div className="p-0 md:p-2">
            <div className="mb-6 md:mb-8">
                <button onClick={handleBackToOverview} className="mb-4 flex items-center text-sm text-blue-400 hover:text-blue-300">
                    <ArrowUturnLeftIcon className="mr-2 h-4 w-4" />
                    Kembali ke Semua Playlist
                </button>
                {isEditingPlaylist ? (
                    <div className="rounded-lg bg-gray-800 p-4 shadow">
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="mb-2 w-full rounded-md border border-gray-600 bg-gray-700 p-2 text-2xl font-bold text-white"
                        />
                        <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder="Deskripsi playlist (opsional)"
                            className="mb-3 h-20 w-full rounded-md border border-gray-600 bg-gray-700 p-2 text-sm text-white"
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setIsEditingPlaylist(false)}
                                className="rounded-md px-3 py-1.5 text-sm text-gray-400 hover:text-white"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSavePlaylistChanges}
                                className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-700"
                            >
                                Simpan Perubahan
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
                        <div>
                            <h1 className="mb-1 text-2xl font-bold text-white md:text-3xl">{playlist.name}</h1>
                            <p className="max-w-xl text-sm text-gray-400">
                                {playlist.description || `Total ${filmsToDisplay.length} tontonan dalam playlist ini.`}
                            </p>
                        </div>
                        <div className="mt-3 flex space-x-2 sm:mt-0">
                            <button
                                onClick={() => setIsEditingPlaylist(true)}
                                title="Edit Playlist"
                                className="rounded-md bg-gray-700 p-2 text-gray-300 hover:bg-gray-600 hover:text-white"
                            >
                                <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                                onClick={handleDeletePlaylist}
                                title="Hapus Playlist"
                                className="rounded-md bg-red-700 p-2 text-white hover:bg-red-600"
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="mb-6 flex justify-end md:mb-8">
                <button
                    onClick={onOpenAddFilmModal}
                    className="flex transform items-center rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:bg-green-700"
                >
                    <PlusIcon className="mr-2 h-5 w-5" />
                    Tambah Film ke Playlist Ini
                </button>
            </div>

            {filmsToDisplay.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
                    {filmsToDisplay.map((film) => (
                        <FilmCard
                            key={film.id} // ID internal film dari DB
                            film={film} // film adalah tipe Film dari DB
                            onCardClick={() => onFilmCardClick(film)}
                            onRateFilm={(newRating) => onRatingUpdated(film.imdb_id, newRating)}
                            onRemoveFromPlaylist={() => onFilmRemoved(playlist.id, film.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="rounded-lg bg-gray-800 py-16 text-center shadow-xl md:py-20">
                    <FilmIcon className="mx-auto mb-4 h-20 w-20 text-gray-600 md:h-24 md:w-24" />
                    <h2 className="mb-2 text-xl font-semibold text-white md:text-2xl">Playlist Ini Masih Kosong</h2>
                    <p className="mb-6 text-gray-400">Tambahkan film atau serial TV pertamamu ke playlist '{playlist.name}'.</p>
                    <button
                        onClick={onOpenAddFilmModal}
                        className="transform rounded-lg bg-green-600 px-6 py-2.5 font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:bg-green-700"
                    >
                        Cari & Tambah Film Sekarang
                    </button>
                </div>
            )}
        </div>
    );
};

export default PlaylistDetailView;
