import PrimaryButton from '@/components/common/PrimaryButton';
import StarRatingInput from '@/components/common/StarRatingInput';
import { showToast } from '@/components/common/ToastNotification';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { PageProps as BasePageProps, OMDbFilmDetail, Playlist as PlaylistType, User } from '@/types'; // Pastikan tipe User diimpor
import {
    ArrowLeftIcon,
    CalendarDaysIcon,
    ClockIcon,
    FilmIcon,
    LanguageIcon,
    MapPinIcon,
    StarIcon,
    TagIcon,
    UsersIcon,
} from '@heroicons/react/24/solid'; // Ikon yang relevan
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import axios from 'axios'; // Untuk menambah ke playlist atau aksi lain jika perlu
import React, { useEffect, useState } from 'react';

interface FilmDetailPageProps extends BasePageProps {
    film: OMDbFilmDetail | null; // Bisa null jika film tidak ditemukan
    error?: string; // Pesan error jika film tidak ditemukan
    userPlaylists: Pick<PlaylistType, 'id' | 'name'>[];
    userRatingForThisFilm?: number | null; // Rating pengguna 1-10 untuk film ini (dari Film model accessor)
    filmInternalId?: number | null; // ID internal film dari DB kita, jika ada
}

export default function FilmDetail() {
    const { props } = usePage<FilmDetailPageProps>();
    const { film, error, userPlaylists, userRatingForThisFilm, filmInternalId } = props;
    const user = props.auth.user as User;

    const [selectedPlaylistsToAdd, setSelectedPlaylistsToAdd] = useState<number[]>([]);
    const [isAddingToPlaylists, setIsAddingToPlaylists] = useState(false);

    // Rating di sini adalah 1-10
    const {
        data: ratingData,
        setData: setRatingData,
        post: postRating,
        processing: processingRating,
        errors: ratingErrors,
        reset: resetRatingForm,
    } = useForm({
        rating: userRatingForThisFilm || 0,
    });

    useEffect(() => {
        // Set rating awal dari props
        setRatingData('rating', userRatingForThisFilm || 0);
    }, [userRatingForThisFilm, setRatingData]);

    const handlePlaylistSelectionChange = (playlistId: number) => {
        setSelectedPlaylistsToAdd((prev) => (prev.includes(playlistId) ? prev.filter((id) => id !== playlistId) : [...prev, playlistId]));
    };

    const handleAddFilmToSelectedPlaylists = async () => {
        if (!film || selectedPlaylistsToAdd.length === 0) return;
        setIsAddingToPlaylists(true);
        try {
            const promises = selectedPlaylistsToAdd.map((playlistId) =>
                axios.post(route('api.playlists.films.add', { playlist: playlistId }), {
                    imdb_id: film.imdbID,
                    title: film.Title,
                    year: film.Year,
                    poster_url: film.Poster,
                    type: film.Type,
                }),
            );
            await Promise.all(promises);
            showToast(`"${film.Title}" berhasil ditambahkan ke playlist terpilih!`, 'success');
            setSelectedPlaylistsToAdd([]); // Reset pilihan
            // Opsional: Refresh data playlist di sidebar atau di tempat lain jika perlu
        } catch (err: any) {
            console.error('Error adding film to selected playlists:', err);
            showToast(err.response?.data?.message || 'Gagal menambahkan film ke beberapa playlist.', 'error');
        } finally {
            setIsAddingToPlaylists(false);
        }
    };

    const handleRatingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!film || !filmInternalId) {
            // Membutuhkan ID internal film untuk rating
            showToast('Tidak dapat menyimpan rating. Film ini mungkin belum tersinkronisasi dengan database lokal.', 'info');
            return;
        }
        try {
            await axios.post(route('api.films.rate', { film: filmInternalId }), { rating: ratingData.rating });
            showToast('Rating berhasil disimpan!', 'success');
            // Rating akan diupdate di props.userRatingForThisFilm pada kunjungan berikutnya,
            // atau Anda bisa update state lokal jika ingin respons instan tanpa reload.
            // Untuk konsistensi, biarkan Inertia yang handle update data dari server.
            // Jika ingin update instan:
            // props.userRatingForThisFilm = ratingData.rating; // Ini tidak akan re-render, perlu state lokal
        } catch (error: any) {
            console.error('Error saving rating on detail page:', error);
            showToast(error.response?.data?.message || 'Gagal menyimpan rating.', 'success');
        }
    };

    if (error || !film) {
        return (
            <AuthenticatedLayout user={user} header={<h2 className="text-xl leading-tight font-semibold text-gray-200">Film Tidak Ditemukan</h2>}>
                <Head title="Film Tidak Ditemukan" />
                <div className="py-12">
                    <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                        <div className="overflow-hidden bg-gray-800 p-6 text-center shadow-xl sm:rounded-lg md:p-8">
                            <FilmIcon className="mx-auto mb-4 h-24 w-24 text-gray-600" />
                            <p className="mb-2 text-xl font-semibold text-red-400">Maaf, detail untuk film ini tidak dapat ditemukan.</p>
                            <p className="mb-6 text-gray-400">{error || 'Film mungkin tidak ada atau ID tidak valid.'}</p>
                            <Link href={route('dashboard')}>
                                <PrimaryButton>Kembali ke Dashboard</PrimaryButton>
                            </Link>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    // Konversi rating 1-10 ke 0-5 untuk StarRatingInput
    const displayRatingForStars = (ratingData.rating || 0) / 2;

    return (
        <AuthenticatedLayout
            user={user}
            header={
                <div className="flex items-center space-x-3">
                    <Link href={route('dashboard')} className="text-gray-400 hover:text-blue-400" title="Kembali ke Dashboard">
                        <ArrowLeftIcon className="h-6 w-6" />
                    </Link>
                    <h2 className="truncate text-xl leading-tight font-semibold text-gray-200" title={film.Title}>
                        Detail: {film.Title}
                    </h2>
                </div>
            }
        >
            <Head title={`Detail: ${film.Title}`} />

            <div className="bg-gray-900 py-8 text-gray-300 md:py-12">
                {/* Hero Section dengan Poster Background */}
                <div
                    className="group relative h-80 bg-cover bg-center md:h-[500px]"
                    style={{
                        backgroundImage: `url(${film.Poster && film.Poster !== 'N/A' ? film.Poster : 'https://via.placeholder.com/1200x500/1F2937/4B5563?text=Image+Not+Available'})`,
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/30 to-transparent md:w-3/5"></div>

                    <div className="relative z-10 mx-auto flex h-full max-w-7xl items-end px-4 pb-8 sm:px-6 md:pb-12 lg:px-8">
                        <div className="md:w-2/3 lg:w-1/2">
                            <h1 className="mb-2 text-3xl font-bold text-white drop-shadow-lg sm:text-4xl md:mb-3 md:text-5xl">{film.Title}</h1>
                            <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-300 md:mb-4">
                                {film.Year && (
                                    <span className="flex items-center">
                                        <CalendarDaysIcon className="mr-1.5 h-4 w-4 text-gray-400" />
                                        {film.Year}
                                    </span>
                                )}
                                {film.Rated && film.Rated !== 'N/A' && (
                                    <span className="flex items-center border-l border-gray-600 pl-3">
                                        <TagIcon className="mr-1.5 h-4 w-4 text-gray-400" />
                                        {film.Rated}
                                    </span>
                                )}
                                {film.Runtime && film.Runtime !== 'N/A' && (
                                    <span className="flex items-center border-l border-gray-600 pl-3">
                                        <ClockIcon className="mr-1.5 h-4 w-4 text-gray-400" />
                                        {film.Runtime}
                                    </span>
                                )}
                            </div>
                            {film.Genre && film.Genre !== 'N/A' && (
                                <p className="mb-4 line-clamp-2 text-sm text-gray-300 md:mb-6">
                                    {film.Genre.split(', ').map((g, i) => (
                                        <span
                                            key={i}
                                            className="mr-1.5 mb-1 inline-block rounded-full bg-gray-700/80 px-2 py-0.5 text-xs text-gray-300"
                                        >
                                            {g}
                                        </span>
                                    ))}
                                </p>
                            )}
                            {/* Tombol Aksi Cepat di Hero */}
                        </div>
                    </div>
                </div>

                {/* Konten Detail Utama */}
                <div className="relative z-20 mx-auto mt-[-60px] max-w-7xl px-4 sm:px-6 md:mt-[-80px] lg:px-8">
                    <div className="rounded-lg bg-gray-800 p-6 shadow-2xl md:p-8">
                        <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
                            {/* Kolom Kiri (Poster di layar kecil, info tambahan di besar) */}
                            <aside className="mb-8 lg:col-span-4 lg:mb-0">
                                <img
                                    src={
                                        film.Poster && film.Poster !== 'N/A'
                                            ? film.Poster
                                            : 'https://via.placeholder.com/400x600/374151/9CA3AF?text=No+Poster'
                                    }
                                    alt={`Poster ${film.Title}`}
                                    className="mx-auto hidden w-full max-w-xs rounded-lg shadow-xl lg:block lg:max-w-none"
                                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/400x600/374151/9CA3AF?text=Error')}
                                />
                                <div className="mt-6 space-y-3 text-sm">
                                    {film.Director !== 'N/A' && (
                                        <p>
                                            <strong className="font-semibold text-gray-200">Sutradara:</strong> {film.Director}
                                        </p>
                                    )}
                                    {film.Writer !== 'N/A' && (
                                        <p>
                                            <strong className="font-semibold text-gray-200">Penulis:</strong> {film.Writer}
                                        </p>
                                    )}
                                    {film.Production !== 'N/A' && (
                                        <p>
                                            <strong className="font-semibold text-gray-200">Produksi:</strong> {film.Production}
                                        </p>
                                    )}
                                    {film.Language !== 'N/A' && (
                                        <p className="flex items-center">
                                            <LanguageIcon className="mr-2 h-4 w-4 text-gray-400" />
                                            <strong className="mr-1 font-semibold text-gray-200">Bahasa:</strong> {film.Language}
                                        </p>
                                    )}
                                    {film.Country !== 'N/A' && (
                                        <p className="flex items-center">
                                            <MapPinIcon className="mr-2 h-4 w-4 text-gray-400" />
                                            <strong className="mr-1 font-semibold text-gray-200">Negara:</strong> {film.Country}
                                        </p>
                                    )}
                                    {film.Awards !== 'N/A' && (
                                        <p>
                                            <strong className="font-semibold text-gray-200">Penghargaan:</strong> {film.Awards}
                                        </p>
                                    )}
                                    {film.BoxOffice !== 'N/A' && (
                                        <p>
                                            <strong className="font-semibold text-gray-200">Box Office:</strong> {film.BoxOffice}
                                        </p>
                                    )}
                                    {film.Website && film.Website !== 'N/A' && (
                                        <p>
                                            <strong className="font-semibold text-gray-200">Website:</strong>{' '}
                                            <a
                                                href={film.Website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="break-all text-blue-400 underline hover:text-blue-300"
                                            >
                                                {film.Website}
                                            </a>
                                        </p>
                                    )}
                                </div>
                            </aside>

                            {/* Kolom Kanan (Plot, Rating, Aksi) */}
                            <main className="lg:col-span-8">
                                <h3 className="mb-3 border-b border-gray-700 pb-2 text-2xl font-semibold text-white">Sinopsis</h3>
                                <p className="mb-6 leading-relaxed whitespace-pre-line text-gray-300">{film.Plot}</p>

                                {film.Actors !== 'N/A' && (
                                    <div className="mb-6">
                                        <h4 className="mb-2 flex items-center text-lg font-semibold text-white">
                                            <UsersIcon className="mr-2 h-5 w-5 text-gray-400" />
                                            Pemeran Utama
                                        </h4>
                                        <p className="text-sm text-gray-400">{film.Actors}</p>
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h4 className="mb-3 flex items-center text-lg font-semibold text-white">
                                        <StarIcon className="mr-2 h-5 w-5 text-yellow-400" />
                                        Rating
                                    </h4>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        {film.imdbRating !== 'N/A' && (
                                            <div className="rounded-md bg-gray-700/50 p-3">
                                                <p className="text-xs text-gray-400">IMDb</p>
                                                <p className="text-xl font-bold text-yellow-400">{film.imdbRating}/10</p>
                                                <p className="text-xs text-gray-500">{film.imdbVotes} suara</p>
                                            </div>
                                        )}
                                        {film.Metascore !== 'N/A' && (
                                            <div className="rounded-md bg-gray-700/50 p-3">
                                                <p className="text-xs text-gray-400">Metascore</p>
                                                <p className="text-xl font-bold">{film.Metascore}</p>
                                            </div>
                                        )}
                                        {film.Ratings &&
                                            film.Ratings.map(
                                                (r, i) =>
                                                    r.Source !== 'Internet Movie Database' &&
                                                    r.Source !== 'Metacritic' && (
                                                        <div key={i} className="rounded-md bg-gray-700/50 p-3">
                                                            <p className="text-xs text-gray-400">{r.Source}</p>
                                                            <p className="text-xl font-bold">{r.Value}</p>
                                                        </div>
                                                    ),
                                            )}
                                    </div>
                                </div>

                                {/* Rating Pengguna */}
                                {filmInternalId && (
                                    <form onSubmit={handleRatingSubmit} className="mb-6 rounded-lg bg-gray-700/50 p-4">
                                        <label htmlFor="userRatingPage" className="mb-2 block text-lg font-medium text-gray-100">
                                            Rating Anda:
                                        </label>
                                        <div className="flex flex-col items-start space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
                                            <StarRatingInput
                                                rating={displayRatingForStars}
                                                onRatingChange={(newStarRating) => setRatingData('rating', newStarRating * 2)}
                                                starSize="w-8 h-8" // Bintang lebih besar
                                            />
                                            <select
                                                id="userRatingPage"
                                                value={ratingData.rating}
                                                onChange={(e) => setRatingData('rating', parseInt(e.target.value))}
                                                className="w-full rounded-md border border-gray-500 bg-gray-600 p-2.5 text-sm text-white focus:border-blue-500 focus:ring-blue-500 sm:w-auto"
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
                                                disabled={processingRating || !filmInternalId}
                                                className="w-full !py-2.5 text-sm whitespace-nowrap sm:w-auto"
                                            >
                                                {processingRating ? 'Menyimpan...' : 'Simpan Rating Saya'}
                                            </PrimaryButton>
                                        </div>
                                        {ratingErrors.rating && <p className="mt-1 text-xs text-red-400">{ratingErrors.rating}</p>}
                                    </form>
                                )}
                                {!filmInternalId && (
                                    <p className="my-4 rounded-md bg-yellow-900/30 p-3 text-sm text-yellow-500">
                                        Film ini belum ada di koleksi Anda. Tambahkan ke playlist untuk bisa memberi rating.
                                    </p>
                                )}

                                {/* Tambah ke Playlist */}
                                {userPlaylists && userPlaylists.length > 0 && (
                                    <div className="mt-8 border-t border-gray-700 pt-6">
                                        <h3 className="mb-3 text-xl font-semibold text-white">Tambahkan ke Playlist Saya:</h3>
                                        <div className="custom-scrollbar mb-4 max-h-48 space-y-2 overflow-y-auto pr-2">
                                            {' '}
                                            {/* Tambahkan custom-scrollbar jika perlu */}
                                            {userPlaylists.map((pl) => (
                                                <label
                                                    key={pl.id}
                                                    className="flex cursor-pointer items-center space-x-3 rounded-md bg-gray-700/50 p-3 transition-colors hover:bg-gray-700"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPlaylistsToAdd.includes(pl.id)}
                                                        onChange={() => handlePlaylistSelectionChange(pl.id)}
                                                        className="h-5 w-5 cursor-pointer rounded border-gray-500 bg-gray-600 text-blue-500 focus:ring-blue-600"
                                                    />
                                                    <span className="text-gray-200">{pl.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <PrimaryButton
                                            onClick={handleAddFilmToSelectedPlaylists}
                                            disabled={selectedPlaylistsToAdd.length === 0 || isAddingToPlaylists}
                                            className="w-full !py-3 text-base"
                                        >
                                            {isAddingToPlaylists
                                                ? 'Menambahkan...'
                                                : `Tambahkan ke Playlist Terpilih (${selectedPlaylistsToAdd.length})`}
                                        </PrimaryButton>
                                    </div>
                                )}
                            </main>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
