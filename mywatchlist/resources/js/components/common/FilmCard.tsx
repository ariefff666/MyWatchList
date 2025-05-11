import { showToast } from '@/components/common/ToastNotification';
import { Film as FilmType } from '@/types';
import { PencilSquareIcon, StarIcon as StarSolidIcon, TrashIcon } from '@heroicons/react/24/solid';
import { useForm } from '@inertiajs/react'; // Menggunakan useForm dari Inertia
import axios from 'axios';
import { LoaderCircleIcon } from 'lucide-react';
import React, { useState } from 'react';
import StarRatingInput from './StarRatingInput';

interface FilmCardProps {
    film: FilmType; // Film dari DB (sudah termasuk ID internal)
    playlistIdContext?: number; // ID playlist tempat film ini ditampilkan (opsional, tapi berguna)
    onCardClick?: () => void;
    onRemoveFromPlaylistSucceeded?: (filmIdToRemove: number, filmTitle: string) => void; // Callback ke parent
    onRateFilm: (newRating: number | null) => void;
}

const FilmCard: React.FC<FilmCardProps> = ({ film, playlistIdContext, onCardClick, onRemoveFromPlaylistSucceeded, onRateFilm }) => {
    const [isRatingMode, setIsRatingMode] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);

    // Rating di sini adalah 1-10
    const { data, setData, post, processing, errors, reset } = useForm({
        rating: film.current_user_rating || 0,
    });

    const handleRatingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Penting agar onCardClick tidak terpicu

        try {
            const response = await axios.post(route('api.films.rate', { film: film.id }), { rating: data.rating });
            onRateFilm(response.data.new_rating); // Update UI di parent dengan rating baru dari backend
            showToast('Rating berhasil disimpan!', 'success');
            setIsRatingMode(false);
            // `reset()` tidak perlu karena `data.rating` akan diupdate oleh `film.current_user_rating` pada render berikutnya
        } catch (error: any) {
            console.error('Rating error:', error);
            alert(error.response?.data?.message || 'Gagal menyimpan rating.');
        }
    };

    const handleRemoveThisFilm = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!playlistIdContext) {
            console.error('Playlist ID context is missing for removing film.');
            showToast('Gagal menghapus film: Informasi playlist tidak lengkap.', 'error');
            return;
        }
        if (!window.confirm(`Anda yakin ingin menghapus "${film.title}" dari playlist ini?`)) {
            return;
        }
        setIsRemoving(true);
        try {
            // Menggunakan film.id (ID internal dari tabel films kita)
            await axios.delete(route('api.playlists.films.remove', { playlist: playlistIdContext, film: film.id }));
            showToast(`"${film.title}" berhasil dihapus dari playlist.`, 'success');
            if (onRemoveFromPlaylistSucceeded) {
                onRemoveFromPlaylistSucceeded(film.id, film.title);
            }
        } catch (error: any) {
            console.error('Error removing film from playlist:', error);
            showToast(error.response?.data?.message || `Gagal menghapus "${film.title}".`, 'error');
        } finally {
            setIsRemoving(false);
        }
    };

    const handleCancelRating = (e: React.MouseEvent) => {
        e.stopPropagation();
        setData('rating', film.current_user_rating || 0); // Kembalikan ke rating awal
        setIsRatingMode(false);
    };

    // Konversi rating 1-10 ke 0-5 untuk StarRatingInput
    const displayRatingForStars = (film.current_user_rating || 0) / 2;

    return (
        <div className="group flex h-full transform flex-col overflow-hidden rounded-lg bg-gray-700/80 shadow-xl backdrop-blur-sm transition-transform duration-300 hover:scale-[1.03]">
            <div onClick={onCardClick} className="relative cursor-pointer">
                <img
                    src={
                        film.poster_url && film.poster_url !== 'N/A'
                            ? film.poster_url
                            : 'https://via.placeholder.com/300x450/374151/9CA3AF?text=Poster+Not+Available'
                    }
                    alt={film.title}
                    className="h-64 w-full object-cover transition-opacity duration-300 group-hover:opacity-80 sm:h-72 md:h-80"
                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/300x450/374151/9CA3AF?text=Error+Loading')}
                />
                {film.imdb_rating && film.imdb_rating !== 'N/A' && (
                    <div className="absolute top-2 right-2 flex items-center rounded-full bg-black/70 px-2 py-1 text-xs font-bold text-yellow-400">
                        <StarSolidIcon className="mr-1 h-3 w-3" /> {film.imdb_rating}
                    </div>
                )}
            </div>

            <div className="flex flex-grow flex-col p-3 md:p-4">
                <h3
                    onClick={onCardClick}
                    className="mb-1 cursor-pointer truncate text-base font-semibold text-white transition-colors hover:text-blue-400 md:text-lg"
                    title={film.title}
                >
                    {film.title}
                </h3>
                <p onClick={onCardClick} className="mb-2 cursor-pointer text-xs text-gray-400">
                    {film.year} {film.type && `(${film.type.charAt(0).toUpperCase() + film.type.slice(1)})`}
                </p>

                {/* User Rating Display & Input */}
                <div className="mb-3">
                    {isRatingMode ? (
                        <form onSubmit={handleRatingSubmit} onClick={(e) => e.stopPropagation()} className="space-y-2">
                            <StarRatingInput
                                rating={data.rating / 2} // Tampilkan rating yang sedang diinput (0-5)
                                onRatingChange={(newStarRating) => setData('rating', newStarRating * 2)} // Update form state (1-10)
                                starSize="w-5 h-5"
                            />
                            <div className="flex items-center space-x-2">
                                <select
                                    value={data.rating}
                                    onChange={(e) => setData('rating', parseInt(e.target.value))}
                                    className="w-full rounded border border-gray-500 bg-gray-600 p-1.5 text-xs text-white focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="0">Belum Dirating</option>
                                    {[...Array(10)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {i + 1}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={handleCancelRating}
                                    className="rounded px-2 py-1 text-xs text-gray-400 hover:text-white"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {processing ? 'Simpan...' : 'OK'}
                                </button>
                            </div>
                            {errors.rating && <p className="mt-1 text-xs text-red-400">{errors.rating}</p>}
                        </form>
                    ) : (
                        <div onClick={onCardClick} className="group/rating flex cursor-pointer items-center space-x-2">
                            <StarRatingInput rating={displayRatingForStars} readOnly={true} starSize="w-4 h-4" />
                            <span className="text-xs text-gray-400">
                                ({film.current_user_rating ? `${film.current_user_rating}/10` : 'Belum dirating'})
                            </span>
                            <PencilSquareIcon
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsRatingMode(true);
                                    setData('rating', film.current_user_rating || 0);
                                }}
                                className="h-4 w-4 text-gray-500 opacity-0 transition-opacity group-hover/rating:text-blue-400 group-hover/rating:opacity-100"
                                title="Ubah Rating"
                            />
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="mt-auto space-y-2 border-t border-gray-600/50 pt-3">
                    {playlistIdContext && onRemoveFromPlaylistSucceeded && !isRatingMode && (
                        <button
                            onClick={handleRemoveThisFilm}
                            disabled={isRemoving}
                            className="flex w-full items-center justify-center rounded bg-red-600/80 px-2 py-1.5 text-xs text-white transition-colors duration-200 hover:bg-red-600 disabled:opacity-50"
                        >
                            {isRemoving ? (
                                <LoaderCircleIcon className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <TrashIcon className="mr-1.5 h-3.5 w-3.5" />
                            )}
                            {isRemoving ? 'Menghapus...' : 'Hapus dari Playlist'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FilmCard;
