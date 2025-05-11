import AddFilmToPlaylistModal from '@/components/dashboard/AddFilmToPlaylistModal';
import CreatePlaylistModal from '@/components/dashboard/CreatePlaylistModal';
import FilmOverviewModal from '@/components/dashboard/FilmOverviewModal';
import PlaylistDetailView from '@/components/dashboard/PlaylistDetailView';
import PlaylistOverview from '@/components/dashboard/PlaylistOverview';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { PageProps as BasePageProps, Film, OMDbFilmDetail, Playlist, User } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

// Definisikan props spesifik untuk halaman Dashboard
interface DashboardPageProps extends BasePageProps {
    initialPlaylists: Playlist[]; // Dari DashboardController
    userPlaylistsForModal: Pick<Playlist, 'id' | 'name'>[]; // Dari DashboardController
    selectedPlaylistIdFromUrl?: string | null; // Jika ada query param ?playlist_id=...
    showCreatePlaylistModalFromUrl?: boolean; // Jika ada query param ?showCreatePlaylistModal=true
}

export default function Dashboard() {
    const { props } = usePage<DashboardPageProps>();
    const { auth, initialPlaylists, userPlaylistsForModal, selectedPlaylistIdFromUrl, showCreatePlaylistModalFromUrl } = props;
    const user = auth.user as User; // Pastikan user adalah tipe User

    const [playlists, setPlaylists] = useState<Playlist[]>(initialPlaylists || []);
    const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

    // State untuk Modals
    const [isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen] = useState(showCreatePlaylistModalFromUrl || false);
    const [isFilmOverviewModalOpen, setIsFilmOverviewModalOpen] = useState(false);
    const [selectedFilmForOverview, setSelectedFilmForOverview] = useState<Film | null>(null); // Film dari DB
    const [isAddFilmModalOpen, setIsAddFilmModalOpen] = useState(false);
    const [playlistForAddingFilm, setPlaylistForAddingFilm] = useState<Playlist | null>(null);

    // Efek untuk menangani perubahan playlist_id dari URL (navigasi sidebar)
    useEffect(() => {
        if (selectedPlaylistIdFromUrl) {
            const foundPlaylist = playlists.find((p) => p.id.toString() === selectedPlaylistIdFromUrl);
            setSelectedPlaylist(foundPlaylist || null);
        } else {
            setSelectedPlaylist(null); // Kembali ke overview jika tidak ada ID
        }
    }, [selectedPlaylistIdFromUrl, playlists]);

    // Efek untuk membuka modal buat playlist dari URL
    useEffect(() => {
        if (showCreatePlaylistModalFromUrl) {
            setIsCreatePlaylistModalOpen(true);
            // Hapus query param dari URL setelah modal dibuka agar tidak terbuka lagi saat refresh
            // Ini bisa dilakukan dengan Inertia.replace atau dengan menghapus param saat modal ditutup.
            // Untuk kesederhanaan, kita akan mengandalkan penutupan modal untuk mereset state.
        }
    }, [showCreatePlaylistModalFromUrl]);

    useEffect(() => {
        if (!selectedPlaylist) refreshPlaylists;
    }, []);

    const refreshPlaylists = useCallback(async () => {
        try {
            axios
                .get(route('api.playlists.index'))
                .then((response) => {
                    setPlaylists(response.data);
                })
                .catch((error) => {
                    console.error('Error fetching user playlists for sidebar:', error);
                    // Handle error, mungkin tampilkan pesan
                });
        } catch (error) {
            console.error('Error refreshing playlists:', error);
            // Tampilkan pesan error ke pengguna jika perlu
        }
    }, []);

    // Handler untuk memilih playlist dari PlaylistOverview atau Sidebar
    const handleSelectPlaylist = (playlist: Playlist | null) => {
        setSelectedPlaylist(playlist);
        if (playlist) {
            // Navigasi dengan Inertia untuk mengubah URL (opsional, tapi baik untuk UX)
            router.visit(route('dashboard', { playlist_id: playlist.id }), { preserveState: true, preserveScroll: true });
        } else {
            router.visit(route('dashboard'), { preserveState: true, preserveScroll: true });
        }
    };

    // Handler setelah playlist baru dibuat
    const handlePlaylistCreated = (newPlaylist: Playlist) => {
        setPlaylists((prev) => [newPlaylist, ...prev.sort((a, b) => a.name.localeCompare(b.name))]); // Tambah dan urutkan
        setSelectedPlaylist(newPlaylist); // Langsung tampilkan detail playlist baru
        setIsCreatePlaylistModalOpen(false);
        router.visit(route('dashboard', { playlist_id: newPlaylist.id }), { preserveState: true, preserveScroll: true });
    };

    // Handler setelah playlist diupdate
    const handlePlaylistUpdated = (updatedPlaylist: Playlist) => {
        setPlaylists((prev) =>
            prev.map((p) => (p.id === updatedPlaylist.id ? { ...p, ...updatedPlaylist } : p)).sort((a, b) => a.name.localeCompare(b.name)),
        );
        if (selectedPlaylist && selectedPlaylist.id === updatedPlaylist.id) {
            setSelectedPlaylist((prev) => (prev ? { ...prev, ...updatedPlaylist } : null));
        }
    };

    // Handler setelah playlist dihapus
    const handlePlaylistDeleted = (deletedPlaylistId: number) => {
        setPlaylists((prev) => prev.filter((p) => p.id !== deletedPlaylistId));
        if (selectedPlaylist && selectedPlaylist.id === deletedPlaylistId) {
            setSelectedPlaylist(null); // Kembali ke overview
            router.visit(route('dashboard'), { preserveState: true, preserveScroll: true });
        }
    };

    // Handler untuk membuka modal overview film
    const openFilmOverviewModal = (film: Film) => {
        setSelectedFilmForOverview(film);
        setIsFilmOverviewModalOpen(true);
    };

    // Handler untuk membuka modal tambah film ke playlist
    const openAddFilmModal = (playlist: Playlist) => {
        setPlaylistForAddingFilm(playlist);
        setIsAddFilmModalOpen(true);
    };

    // Handler setelah film ditambahkan ke playlist (dari AddFilmToPlaylistModal)
    const handleFilmAddedToPlaylist = (playlistId: number, addedFilmData: OMDbFilmDetail) => {
        // Refresh playlist yang relevan atau seluruh daftar playlist
        refreshPlaylists().then(() => {
            // Jika playlist yang sedang dilihat adalah target, update state-nya
            if (selectedPlaylist && selectedPlaylist.id === playlistId) {
                // Idealnya, backend mengembalikan data film yang sudah di-format sesuai model Film kita
                // Untuk sementara, kita asumsikan refreshPlaylists sudah cukup
                // atau kita bisa menambahkan film secara manual ke state selectedPlaylist.films
                const updatedSelectedPlaylist = playlists.find((p) => p.id === playlistId);
                if (updatedSelectedPlaylist) setSelectedPlaylist(updatedSelectedPlaylist);
            }
        });
        // setIsAddFilmModalOpen(false); // Tutup modal setelah berhasil (opsional)
    };

    // Handler setelah rating film diupdate (dari FilmCard atau FilmOverviewModal)
    const handleRatingUpdated = (filmImdbId: string, newRating: number | null) => {
        // Update state playlists dan selectedPlaylist
        const updateFilmRating = (film: Film) => (film.imdb_id === filmImdbId ? { ...film, current_user_rating: newRating } : film);

        setPlaylists((prevPlaylists) =>
            prevPlaylists.map((p) => ({
                ...p,
                films: p.films?.map(updateFilmRating),
            })),
        );

        if (selectedPlaylist) {
            setSelectedPlaylist((prevSelected) =>
                prevSelected
                    ? {
                          ...prevSelected,
                          films: prevSelected.films?.map(updateFilmRating),
                      }
                    : null,
            );
        }
        // Juga update selectedFilmForOverview jika sedang terbuka
        if (selectedFilmForOverview && selectedFilmForOverview.imdb_id === filmImdbId) {
            setSelectedFilmForOverview((prev) => (prev ? { ...prev, current_user_rating: newRating } : null));
        }
    };

    // Handler setelah film dihapus dari playlist
    const handleFilmRemovedFromPlaylist = (playlistId: number, filmDbId: number) => {
        refreshPlaylists().then(() => {
            if (selectedPlaylist && selectedPlaylist.id === playlistId) {
                const updatedSelectedPlaylist = playlists.find((p) => p.id === playlistId);
                if (updatedSelectedPlaylist) setSelectedPlaylist(updatedSelectedPlaylist);
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={user}
            header={
                <h2 className="text-xl leading-tight font-semibold text-gray-200">
                    {selectedPlaylist ? `Playlist: ${selectedPlaylist.name}` : 'Dashboard Film'}
                </h2>
            }
            onCreateNewPlaylist={() => setIsCreatePlaylistModalOpen(true)}
        >
            <Head title={selectedPlaylist ? selectedPlaylist.name : 'Dashboard'} />

            <div className="py-2 md:py-6">
                {' '}
                {/* Kurangi padding atas jika header sudah ada */}
                <div className="mx-auto max-w-full sm:px-6 lg:px-8">
                    {selectedPlaylist ? (
                        <PlaylistDetailView
                            key={selectedPlaylist.id} // Key untuk re-render saat playlist berubah
                            playlist={selectedPlaylist}
                            onOpenAddFilmModal={() => openAddFilmModal(selectedPlaylist)}
                            onFilmCardClick={openFilmOverviewModal}
                            onRatingUpdated={handleRatingUpdated}
                            onFilmRemoved={handleFilmRemovedFromPlaylist}
                            onPlaylistDetailsUpdated={handlePlaylistUpdated} // Untuk edit nama/deskripsi playlist
                            onPlaylistDeleted={handlePlaylistDeleted} // Untuk hapus playlist dari detail view
                        />
                    ) : (
                        <PlaylistOverview
                            playlists={playlists}
                            onViewPlaylist={(playlistId) => {
                                const pl = playlists.find((p) => p.id === playlistId);
                                if (pl) handleSelectPlaylist(pl);
                            }}
                            onCreateNewPlaylist={() => setIsCreatePlaylistModalOpen(true)}
                        />
                    )}
                </div>
            </div>

            {/* Modals */}
            <CreatePlaylistModal
                isOpen={isCreatePlaylistModalOpen}
                onClose={() => {
                    setIsCreatePlaylistModalOpen(false);
                    // Hapus query param jika ada
                    if (showCreatePlaylistModalFromUrl) {
                        router.visit(route('dashboard'), { preserveState: true, preserveScroll: true, replace: true });
                    }
                }}
                onPlaylistCreated={handlePlaylistCreated}
            />

            {selectedFilmForOverview && (
                <FilmOverviewModal
                    filmId={selectedFilmForOverview.imdb_id} // Kirim IMDb ID
                    initialFilmData={selectedFilmForOverview} // Kirim data film dari DB jika ada
                    isOpen={isFilmOverviewModalOpen}
                    onClose={() => setIsFilmOverviewModalOpen(false)}
                    userPlaylists={userPlaylistsForModal} // Semua playlist user untuk opsi "Tambah ke Playlist Lain"
                    onRatingUpdated={handleRatingUpdated}
                    onFilmAddedToDifferentPlaylist={(playlistId, filmData) => {
                        // Jika film ditambahkan ke playlist LAIN dari modal ini
                        console.log(`${filmData.Title} ditambahkan ke playlist ID ${playlistId}`);
                        refreshPlaylists(); // Refresh semua playlist
                    }}
                />
            )}

            {playlistForAddingFilm && (
                <AddFilmToPlaylistModal
                    isOpen={isAddFilmModalOpen}
                    onClose={() => setIsAddFilmModalOpen(false)}
                    currentPlaylist={playlistForAddingFilm}
                    onFilmAdded={(addedFilm) => handleFilmAddedToPlaylist(playlistForAddingFilm.id, addedFilm)}
                />
            )}
        </AuthenticatedLayout>
    );
}
