import { Film as LocalFilm, OMDbFilmDetail, Playlist } from '@/types';
import { ArrowTopRightOnSquareIcon, PlusCircleIcon } from '@heroicons/react/24/solid';
import { Link, useForm } from '@inertiajs/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import PrimaryButton from '../common/PrimaryButton';
import SecondaryButton from '../common/SecondaryButton';
import StarRatingInput from '../common/StarRatingInput';

interface FilmOverviewModalProps {
    filmId: string; // IMDb ID
    initialFilmData?: LocalFilm | null; // Data film dari DB lokal jika sudah ada (termasuk current_user_rating)
    isOpen: boolean;
    onClose: () => void;
    userPlaylists: Pick<Playlist, 'id' | 'name'>[];
    onRatingUpdated: (filmImdbId: string, newRating: number | null) => void;
    onFilmAddedToDifferentPlaylist: (playlistId: number, filmData: OMDbFilmDetail) => void; // Jika ditambah ke playlist DARI modal ini
}

const FilmOverviewModal: React.FC<FilmOverviewModalProps> = ({
    filmId,
    initialFilmData,
    isOpen,
    onClose,
    userPlaylists,
    onRatingUpdated,
    onFilmAddedToDifferentPlaylist,
}) => {
    const [filmDetail, setFilmDetail] = useState<OMDbFilmDetail | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedPlaylistIdForAdding, setSelectedPlaylistIdForAdding] = useState<string>('');
    const [isAddingToPlaylist, setIsAddingToPlaylist] = useState(false);

    // Rating di sini adalah 1-10
    const {
        data: ratingData,
        setData: setRatingData,
        post: postRating,
        processing: processingRating,
        errors: ratingErrors,
        reset: resetRatingForm,
    } = useForm({
        rating: initialFilmData?.current_user_rating || 0,
    });

    useEffect(() => {
        if (isOpen && filmId) {
            setIsLoading(true);
            setError(null);
            setFilmDetail(null); // Reset detail film sebelumnya
            setSelectedPlaylistIdForAdding(''); // Reset pilihan playlist

            axios
                .get(route('api.omdb.film.detail', { imdbId: filmId }))
                .then((response) => {
                    setFilmDetail(response.data);
                    // Set rating dari initialFilmData jika ada, karena OMDb tidak punya user rating kita
                    setRatingData('rating', initialFilmData?.current_user_rating || 0);
                })
                .catch((err) => {
                    console.error('Error fetching film detail for overview:', err);
                    setError(err.response?.data?.Error || err.response?.data?.message || 'Gagal memuat detail film.');
                })
                .finally(() => setIsLoading(false));
        }
    }, [isOpen, filmId, initialFilmData, setRatingData]); // Tambahkan setRatingData ke dependency array

    useEffect(() => {
        if (!isOpen) {
            resetRatingForm(); // Reset form rating saat modal ditutup
        }
    }, [isOpen, resetRatingForm]);

    const handleAddToPlaylist = async () => {
        if (!selectedPlaylistIdForAdding || !filmDetail) return;
        setIsAddingToPlaylist(true);
        try {
            // Backend akan menangani pembuatan entri Film jika belum ada
            await axios.post(route('api.playlists.films.add', { playlist: selectedPlaylistIdForAdding }), {
                imdb_id: filmDetail.imdbID,
                title: filmDetail.Title, // Kirim data dasar, backend bisa fetch lebih jika perlu
                year: filmDetail.Year,
                poster_url: filmDetail.Poster,
                type: filmDetail.Type,
            });
            onFilmAddedToDifferentPlaylist(parseInt(selectedPlaylistIdForAdding), filmDetail);
            alert(`"${filmDetail.Title}" berhasil ditambahkan ke playlist!`);
            setSelectedPlaylistIdForAdding(''); // Reset pilihan
        } catch (err: any) {
            console.error('Error adding to playlist from overview:', err);
            alert(err.response?.data?.message || 'Gagal menambahkan film ke playlist.');
        } finally {
            setIsAddingToPlaylist(false);
        }
    };

    const handleRateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!filmDetail || !initialFilmData) {
            // Membutuhkan initialFilmData untuk ID internal film
            alert('Tidak dapat menyimpan rating. Data film lokal tidak ditemukan.');
            return;
        }

        try {
            // Menggunakan ID internal film (initialFilmData.id) untuk endpoint rating
            const response = await axios.post(route('api.films.rate', { film: initialFilmData.id }), { rating: ratingData.rating });
            onRatingUpdated(filmDetail.imdbID, response.data.new_rating);
            alert('Rating berhasil disimpan!');
        } catch (error: any) {
            console.error('Error saving rating from overview:', error);
            alert(error.response?.data?.message || 'Gagal menyimpan rating.');
        }
    };

    const renderStarsForDisplay = (rating1to10: number | null | undefined) => {
        return (rating1to10 || 0) / 2;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Ringkasan Film" maxWidth="4xl">
            <div className="max-h-[85vh] overflow-y-auto bg-gray-800 p-6 text-gray-200">
                {isLoading && (
                    <div className="py-10 text-center">
                        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
                        <p className="mt-3">Memuat detail film...</p>
                    </div>
                )}
                {error && <div className="rounded-md bg-red-900/20 p-4 py-10 text-center text-red-400">{error}</div>}

                {filmDetail && !isLoading && !error && (
                    <div className="md:grid md:grid-cols-3 md:gap-x-6 lg:gap-x-8">
                        {/* Kolom Kiri: Poster & Aksi Cepat */}
                        <div className="mb-6 md:col-span-1 md:mb-0">
                            <img
                                src={
                                    filmDetail.Poster && filmDetail.Poster !== 'N/A'
                                        ? filmDetail.Poster
                                        : 'https://via.placeholder.com/400x600/374151/9CA3AF?text=No+Poster'
                                }
                                alt={filmDetail.Title}
                                className="mb-6 w-full rounded-lg object-cover shadow-lg"
                                onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/400x600/374151/9CA3AF?text=Error')}
                            />

                            {/* Tambah ke Playlist */}
                            {userPlaylists && userPlaylists.length > 0 && (
                                <div className="mb-6 space-y-3">
                                    <label htmlFor="addToPlaylistOverview" className="block text-sm font-medium text-gray-300">
                                        Tambahkan ke Playlist:
                                    </label>
                                    <div className="flex space-x-2">
                                        <select
                                            id="addToPlaylistOverview"
                                            value={selectedPlaylistIdForAdding}
                                            onChange={(e) => setSelectedPlaylistIdForAdding(e.target.value)}
                                            className="flex-grow rounded-md border border-gray-600 bg-gray-700 p-2.5 text-sm text-white focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            <option value="">Pilih Playlist...</option>
                                            {userPlaylists.map((pl) => (
                                                <option key={pl.id} value={pl.id}>
                                                    {pl.name}
                                                </option>
                                            ))}
                                        </select>
                                        <PrimaryButton
                                            onClick={handleAddToPlaylist}
                                            disabled={!selectedPlaylistIdForAdding || isAddingToPlaylist}
                                            className="!py-2.5 whitespace-nowrap"
                                        >
                                            {isAddingToPlaylist ? (
                                                <PlusCircleIcon className="mr-1 h-5 w-5 animate-spin" />
                                            ) : (
                                                <PlusCircleIcon className="mr-1 h-5 w-5" />
                                            )}
                                            {isAddingToPlaylist ? 'Menambah...' : 'Tambah'}
                                        </PrimaryButton>
                                    </div>
                                </div>
                            )}
                            <Link
                                href={route('film.show.page', { imdbId: filmDetail.imdbID })}
                                className="flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                                onClick={onClose} // Tutup modal saat navigasi
                            >
                                <ArrowTopRightOnSquareIcon className="mr-2 h-4 w-4" />
                                Lihat Detail Lengkap
                            </Link>
                        </div>

                        {/* Kolom Kanan: Detail Film & Rating Pengguna */}
                        <div className="md:col-span-2">
                            <h3 className="mb-1 text-3xl font-bold text-white">{filmDetail.Title}</h3>
                            <p className="mb-4 text-sm text-gray-400">
                                {filmDetail.Year} &bull; {filmDetail.Rated} &bull; {filmDetail.Runtime}
                            </p>

                            <div className="mb-4">
                                <span className="font-semibold text-gray-300">Genre: </span>
                                <span>{filmDetail.Genre}</span>
                            </div>
                            <div className="mb-4">
                                <span className="font-semibold text-gray-300">Sutradara: </span>
                                <span>{filmDetail.Director}</span>
                            </div>
                            <div className="mb-4">
                                <span className="font-semibold text-gray-300">Aktor: </span>
                                <span>{filmDetail.Actors}</span>
                            </div>
                            <div className="mb-4">
                                <span className="font-semibold text-gray-300">Rating IMDb: </span>
                                <span className="text-yellow-400">{filmDetail.imdbRating}/10</span>
                                <span className="ml-1 text-xs text-gray-500">({filmDetail.imdbVotes} suara)</span>
                            </div>
                            {filmDetail.Ratings &&
                                filmDetail.Ratings.map(
                                    (rating, index) =>
                                        rating.Source !== 'Internet Movie Database' && (
                                            <div key={index} className="mb-1 text-sm">
                                                <span className="font-semibold text-gray-300">{rating.Source}: </span>
                                                <span>{rating.Value}</span>
                                            </div>
                                        ),
                                )}

                            <h4 className="text-md mt-6 mb-2 font-semibold text-white">Sinopsis</h4>
                            <p className="mb-6 text-sm leading-relaxed text-gray-300">{filmDetail.Plot}</p>

                            {/* Rating Pengguna */}
                            {initialFilmData && ( // Hanya tampilkan jika film ini ada di DB lokal (artinya bisa dirating)
                                <form onSubmit={handleRateSubmit} className="mt-6 border-t border-gray-700 pt-4">
                                    <label htmlFor="userRatingOverview" className="mb-2 block text-sm font-medium text-gray-200">
                                        Rating Anda untuk film ini:
                                    </label>
                                    <div className="flex flex-col items-start space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
                                        <StarRatingInput
                                            rating={renderStarsForDisplay(ratingData.rating)}
                                            onRatingChange={(newStarRating) => setRatingData('rating', newStarRating * 2)}
                                            starSize="w-7 h-7"
                                        />
                                        <select
                                            id="userRatingOverview"
                                            value={ratingData.rating}
                                            onChange={(e) => setRatingData('rating', parseInt(e.target.value))}
                                            className="w-full rounded-md border border-gray-600 bg-gray-700 p-2 text-sm text-white focus:border-blue-500 focus:ring-blue-500 sm:w-auto"
                                        >
                                            <option value="0">-- Beri Rating (1-10) --</option>
                                            {[...Array(10)].map((_, i) => (
                                                <option key={i + 1} value={i + 1}>
                                                    {i + 1}
                                                </option>
                                            ))}
                                        </select>
                                        <PrimaryButton
                                            type="submit"
                                            disabled={processingRating || !initialFilmData}
                                            className="!py-2 text-sm whitespace-nowrap"
                                        >
                                            {processingRating ? 'Menyimpan...' : 'Simpan Rating'}
                                        </PrimaryButton>
                                    </div>
                                    {ratingErrors.rating && <p className="mt-1 text-xs text-red-400">{ratingErrors.rating}</p>}
                                    {!initialFilmData && (
                                        <p className="mt-1 text-xs text-yellow-500">Film ini belum ada di koleksi Anda untuk dirating.</p>
                                    )}
                                </form>
                            )}
                        </div>
                    </div>
                )}
                <div className="mt-8 border-t border-gray-700 pt-6 text-right">
                    <SecondaryButton onClick={onClose} className="text-gray-300 hover:bg-gray-700">
                        Tutup
                    </SecondaryButton>
                </div>
            </div>
        </Modal>
    );
};

export default FilmOverviewModal;
