import { OMDbFilmDetail, OMDbFilmSearchResult, OMDbSearchResponse, Playlist } from '@/types';
import { InformationCircleIcon, MagnifyingGlassIcon, PlusCircleIcon } from '@heroicons/react/24/solid';
import { router } from '@inertiajs/react';
import axios from 'axios';
import debounce from 'lodash.debounce';
import React, { useCallback, useEffect, useState } from 'react';
import Modal from '../common/Modal';
import PrimaryButton from '../common/PrimaryButton';
import SecondaryButton from '../common/SecondaryButton';
import TextInput from '../common/TextInput';
import { showToast } from '../common/ToastNotification';

interface AddFilmToPlaylistModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPlaylist: Playlist;
    onFilmAdded: (addedFilm: OMDbFilmDetail) => void; // Callback setelah film berhasil ditambahkan
}

const AddFilmToPlaylistModal: React.FC<AddFilmToPlaylistModalProps> = ({ isOpen, onClose, currentPlaylist, onFilmAdded }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState<'movie' | 'series' | ''>(''); // Tipe pencarian
    const [searchResults, setSearchResults] = useState<OMDbFilmSearchResult[]>([]);
    const [totalResults, setTotalResults] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState<string | null>(null); // imdbID film yang sedang ditambahkan

    const performSearch = useCallback(
        async (query: string, type: string, page: number) => {
            if (query.length < 3) {
                setSearchResults([]);
                setTotalResults(0);
                setError(null);
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.get(route('api.omdb.search', { query, type, page }));
                const data: OMDbSearchResponse = response.data;
                if (data.Response === 'True' && data.Search) {
                    setSearchResults(page === 1 ? data.Search : (prevResults) => [...prevResults, ...data.Search!]);
                    setTotalResults(parseInt(data.totalResults || '0'));
                } else {
                    setSearchResults(page === 1 ? [] : searchResults); // Jangan hapus hasil lama jika load more gagal
                    setError(data.Error || 'Tidak ada hasil ditemukan atau terjadi kesalahan.');
                    if (page === 1) setTotalResults(0);
                }
            } catch (err: any) {
                console.error('Search error:', err);
                setError(err.response?.data?.message || 'Gagal melakukan pencarian.');
                setSearchResults(page === 1 ? [] : searchResults);
                if (page === 1) setTotalResults(0);
            } finally {
                setIsLoading(false);
            }
        },
        [searchResults],
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSearch = useCallback(
        debounce((query: string, type: string) => {
            setCurrentPage(1);
            performSearch(query, type, 1);
        }, 600),
        [performSearch],
    );

    useEffect(() => {
        if (searchTerm.length === 0 || searchTerm.length >= 3) {
            debouncedSearch(searchTerm, searchType);
        } else {
            setSearchResults([]);
            setTotalResults(0);
            setError(null);
        }
        return () => {
            debouncedSearch.cancel();
        };
    }, [searchTerm, searchType]);

    const handleLoadMore = () => {
        if (searchResults.length < totalResults && !isLoading) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            performSearch(searchTerm, searchType, nextPage);
        }
    };

    const handleAddFilmToCurrentPlaylist = async (filmResult: OMDbFilmSearchResult) => {
        setIsAdding(filmResult.imdbID);
        try {
            // Backend akan menangani fetch detail lengkap dan penyimpanan ke DB Film jika perlu
            const response = await axios.post(route('api.playlists.films.add', { playlist: currentPlaylist.id }), {
                imdb_id: filmResult.imdbID,
                title: filmResult.Title, // Kirim data dasar
                year: filmResult.Year,
                poster_url: filmResult.Poster,
                type: filmResult.Type,
            });
            // Asumsi backend mengembalikan data film yang sudah di-format (OMDbFilmDetail atau Film dari DB)
            onFilmAdded(response.data.film as OMDbFilmDetail); // Sesuaikan tipe jika backend mengembalikan Film lokal
            showToast(`"${filmResult.Title}" berhasil ditambahkan ke playlist "${currentPlaylist.name}"!`, 'success');
        } catch (err: any) {
            console.error('Error adding film to current playlist:', err);
            showToast(err.response?.data?.message || `Gagal menambahkan "${filmResult.Title}".`, 'error');
        } finally {
            setIsAdding(null);
        }
    };

    const viewFilmDetailPage = (imdbId: string) => {
        onClose(); // Tutup modal ini dulu
        router.visit(route('film.show.page', { imdbId })); // Navigasi ke halaman detail
    };

    const handleCloseModal = () => {
        setSearchTerm('');
        setSearchType('');
        setSearchResults([]);
        setTotalResults(0);
        setCurrentPage(1);
        setError(null);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleCloseModal} title={`Tambah Film ke "${currentPlaylist.name}"`} maxWidth="3xl">
            <div className="flex max-h-[85vh] flex-col bg-gray-800 p-0">
                {' '}
                {/* Konten modal tanpa padding awal */}
                {/* Header Pencarian */}
                <div className="sticky top-0 z-10 border-b border-gray-700 bg-gray-800 p-5">
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="relative flex-grow">
                            <TextInput
                                type="text"
                                placeholder="Cari judul film, serial TV..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full border-gray-600 bg-gray-700 p-3 pl-10 text-white focus:border-blue-500 focus:ring-blue-500"
                            />
                            <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        </div>
                        <select
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value as 'movie' | 'series' | '')}
                            className="rounded-md border-gray-600 bg-gray-700 p-3 text-sm text-white focus:border-blue-500 focus:ring-blue-500 sm:w-auto"
                        >
                            <option value="">Semua Tipe</option>
                            <option value="movie">Film (Movie)</option>
                            <option value="series">Serial TV (Series)</option>
                        </select>
                    </div>
                </div>
                {/* Hasil Pencarian */}
                <div className="flex-grow space-y-3 overflow-y-auto p-5">
                    {isLoading && currentPage === 1 && (
                        <div className="py-10 text-center">
                            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-blue-500"></div>
                            <p className="mt-2 text-gray-300">Mencari...</p>
                        </div>
                    )}
                    {error && <p className="rounded-md bg-red-900/20 p-3 text-center text-red-400">{error}</p>}

                    {!isLoading && searchResults.length === 0 && searchTerm.length >= 3 && !error && (
                        <p className="py-10 text-center text-gray-400">Tidak ada hasil ditemukan untuk "{searchTerm}".</p>
                    )}

                    {searchResults.map((film) => (
                        <div
                            key={film.imdbID}
                            className="flex items-center rounded-lg bg-gray-700/70 p-3 shadow-md transition-colors hover:bg-gray-700"
                        >
                            <img
                                src={film.Poster && film.Poster !== 'N/A' ? film.Poster : 'https://via.placeholder.com/60x90/374151/9CA3AF?text=N/A'}
                                alt={film.Title}
                                className="mr-4 h-24 w-16 rounded object-cover shadow"
                                onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/60x90/374151/9CA3AF?text=Error')}
                            />
                            <div className="flex-grow">
                                <p className="text-md leading-tight font-semibold text-white">{film.Title}</p>
                                <p className="text-sm text-gray-400">
                                    {film.Year} &bull; <span className="capitalize">{film.Type}</span>
                                </p>
                            </div>
                            <div className="ml-3 flex flex-shrink-0 flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
                                <button
                                    onClick={() => viewFilmDetailPage(film.imdbID)}
                                    className="flex w-full items-center justify-center rounded-md bg-gray-600 px-3 py-1.5 text-xs text-white transition-colors duration-200 hover:bg-blue-600 sm:w-auto"
                                    title="Lihat Detail Film"
                                >
                                    <InformationCircleIcon className="mr-1 h-4 w-4 sm:mr-0 md:mr-1" />{' '}
                                    <span className="sm:hidden md:inline">Detail</span>
                                </button>
                                <PrimaryButton
                                    onClick={() => handleAddFilmToCurrentPlaylist(film)}
                                    disabled={isAdding === film.imdbID}
                                    className="w-full !px-3 !py-1.5 !text-xs sm:w-auto"
                                >
                                    {isAdding === film.imdbID ? (
                                        <PlusCircleIcon className="mr-1 h-4 w-4 animate-spin" />
                                    ) : (
                                        <PlusCircleIcon className="mr-1 h-4 w-4" />
                                    )}
                                    {isAdding === film.imdbID ? 'Menambah...' : 'Tambah'}
                                </PrimaryButton>
                            </div>
                        </div>
                    ))}
                    {isLoading && currentPage > 1 && (
                        <div className="py-5 text-center">
                            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
                            <p className="mt-1 text-sm text-gray-300">Memuat lebih banyak...</p>
                        </div>
                    )}
                    {!isLoading && searchResults.length > 0 && searchResults.length < totalResults && (
                        <div className="mt-4 text-center">
                            <SecondaryButton onClick={handleLoadMore} className="text-sm">
                                Muat Lebih Banyak ({searchResults.length}/{totalResults})
                            </SecondaryButton>
                        </div>
                    )}
                </div>
                {/* Footer Modal */}
                <div className="sticky bottom-0 z-10 border-t border-gray-700 bg-gray-800 p-5 text-right">
                    <SecondaryButton onClick={handleCloseModal} className="text-gray-300 hover:bg-gray-600">
                        Selesai & Tutup
                    </SecondaryButton>
                </div>
            </div>
        </Modal>
    );
};

export default AddFilmToPlaylistModal;
