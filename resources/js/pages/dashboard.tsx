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

interface DashboardPageProps extends BasePageProps {
    initialPlaylists: Playlist[];
    userPlaylistsForModal: Pick<Playlist, 'id' | 'name'>[];
    selectedPlaylistDataFromController?: Playlist | null; // Dari PlaylistController@showPage atau DashboardController
    showCreatePlaylistModalFromUrl?: boolean;
}

export default function Dashboard() {
    const { props } = usePage<DashboardPageProps>();
    const { auth, initialPlaylists, userPlaylistsForModal, selectedPlaylistDataFromController, showCreatePlaylistModalFromUrl } = props;
    const user = auth.user as User;

    // initialPlaylists adalah daftar semua playlist untuk overview
    // selectedPlaylistDataFromController adalah playlist spesifik jika kita di /playlist/{id}
    const [allPlaylistsForOverview, setAllPlaylistsForOverview] = useState<Playlist[]>(initialPlaylists || []);
    const [currentSelectedPlaylist, setCurrentSelectedPlaylist] = useState<Playlist | null>(selectedPlaylistDataFromController || null);

    // State untuk Modals
    const [isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen] = useState(showCreatePlaylistModalFromUrl || false);
    const [isFilmOverviewModalOpen, setIsFilmOverviewModalOpen] = useState(false);
    const [selectedFilmForOverview, setSelectedFilmForOverview] = useState<Film | null>(null);
    const [isAddFilmModalOpen, setIsAddFilmModalOpen] = useState(false);
    const [playlistForAddingFilm, setPlaylistForAddingFilm] = useState<Playlist | null>(null);

    // Efek untuk sinkronisasi dengan prop dari controller
    useEffect(() => {
        setAllPlaylistsForOverview(initialPlaylists || []);
        setCurrentSelectedPlaylist(selectedPlaylistDataFromController || null);
    }, [initialPlaylists, selectedPlaylistDataFromController]);

    useEffect(() => {
        if (showCreatePlaylistModalFromUrl && !isCreatePlaylistModalOpen) {
            setIsCreatePlaylistModalOpen(true);
        }
    }, [showCreatePlaylistModalFromUrl, isCreatePlaylistModalOpen]);

    useEffect(() => {
        refreshAllPlaylistsForOverview();
    }, []);

    const refreshAllPlaylistsForOverview = useCallback(async () => {
        try {
            axios
                .get(route('api.playlists.index'))
                .then((response) => setAllPlaylistsForOverview(response.data))
                .catch((error) => console.error('Error fetching user playlists:', error));
            // Dispatch event untuk memberitahu sidebar agar refresh juga
            window.dispatchEvent(new CustomEvent('refreshSidebarPlaylists'));
        } catch (error) {
            console.error('Error refreshing all playlists for overview:', error);
        }
    }, []);

    const refreshCurrentSelectedPlaylist = useCallback(async (playlistId: number) => {
        // Untuk me-refresh detail playlist yang sedang ditampilkan
        // Ini bisa dilakukan dengan Inertia visit ke route playlist itu lagi
        // atau dengan panggilan API khusus jika ada.
        // Untuk sekarang, kita akan mengandalkan navigasi ulang atau refresh global.
        router.visit(route('playlist.show', { playlist: playlistId }), {
            preserveState: true, // Pertahankan state modal jika ada
            preserveScroll: true,
            only: ['selectedPlaylistDataFromController'], // Hanya minta data ini
            onSuccess: (page: any) => {
                const updatedPlaylist = (page.props as DashboardPageProps).selectedPlaylistDataFromController;
                if (updatedPlaylist) {
                    setCurrentSelectedPlaylist(updatedPlaylist);
                    // Update juga di allPlaylistsForOverview
                    setAllPlaylistsForOverview((prev) =>
                        prev.map((p) => (p.id === updatedPlaylist.id ? { ...p, ...updatedPlaylist, films_count: updatedPlaylist.films?.length } : p)),
                    );
                }
            },
        });
    }, []);

    const handlePlaylistCreated = (newPlaylist: Playlist) => {
        // Tampilkan notifikasi (Toast)
        window.dispatchEvent(
            new CustomEvent('showToast', { detail: { message: `Playlist "${newPlaylist.name}" berhasil dibuat!`, type: 'success' } }),
        );
        setIsCreatePlaylistModalOpen(false);
        refreshAllPlaylistsForOverview(); // Refresh daftar di overview & sidebar
        // Navigasi ke halaman detail playlist yang baru dibuat
        router.visit(route('playlist.show', { playlist: newPlaylist.id }));
    };

    const handlePlaylistUpdated = (updatedPlaylist: Playlist) => {
        window.dispatchEvent(
            new CustomEvent('showToast', { detail: { message: `Playlist "${updatedPlaylist.name}" berhasil diperbarui.`, type: 'success' } }),
        );
        if (currentSelectedPlaylist && currentSelectedPlaylist.id === updatedPlaylist.id) {
            setCurrentSelectedPlaylist((prev) => (prev ? { ...prev, ...updatedPlaylist } : null));
        }
        refreshAllPlaylistsForOverview();
        window.dispatchEvent(new CustomEvent('refreshSidebarPlaylists'));
    };

    const handlePlaylistDeleted = (deletedPlaylistId: number, playlistName: string) => {
        window.dispatchEvent(new CustomEvent('showToast', { detail: { message: `Playlist "${playlistName}" berhasil dihapus.`, type: 'success' } }));
        setAllPlaylistsForOverview((prev) => prev.filter((p) => p.id !== deletedPlaylistId));
        if (currentSelectedPlaylist && currentSelectedPlaylist.id === deletedPlaylistId) {
            router.visit(route('dashboard')); // Kembali ke overview
        }
        window.dispatchEvent(new CustomEvent('refreshSidebarPlaylists'));
    };

    const openFilmOverviewModal = (film: Film) => {
        setSelectedFilmForOverview(film);
        setIsFilmOverviewModalOpen(true);
    };

    const openAddFilmModal = (playlist: Playlist) => {
        setPlaylistForAddingFilm(playlist);
        setIsAddFilmModalOpen(true);
    };

    const handleFilmAddedToPlaylist = (playlistId: number, addedFilmData: OMDbFilmDetail) => {
        // window.dispatchEvent(
        //     new CustomEvent('showToast', { detail: { message: `"${addedFilmData.Title}" ditambahkan ke playlist.`, type: 'success' } }),
        // );
        if (currentSelectedPlaylist && currentSelectedPlaylist.id === playlistId) {
            refreshCurrentSelectedPlaylist(playlistId);
        }
        refreshAllPlaylistsForOverview(); // Untuk update count di overview/sidebar
    };

    const handleRatingUpdated = (filmImdbId: string, newRating: number | null) => {
        // window.dispatchEvent(new CustomEvent('showToast', { detail: { message: `Rating film berhasil diperbarui.`, type: 'success' } }));
        // Update state currentSelectedPlaylist jika film ada di dalamnya
        if (currentSelectedPlaylist) {
            setCurrentSelectedPlaylist((prevPlaylist) => {
                if (!prevPlaylist || !prevPlaylist.films) return prevPlaylist;
                return {
                    ...prevPlaylist,
                    films: prevPlaylist.films.map((f) => (f.imdb_id === filmImdbId ? { ...f, current_user_rating: newRating } : f)),
                };
            });
        }
        // Juga update selectedFilmForOverview jika sedang terbuka
        if (selectedFilmForOverview && selectedFilmForOverview.imdb_id === filmImdbId) {
            setSelectedFilmForOverview((prev) => (prev ? { ...prev, current_user_rating: newRating } : null));
        }
        // Refresh playlist di overview untuk update rating di FilmCard jika ditampilkan di sana
        refreshAllPlaylistsForOverview();
    };

    const handleFilmRemovedFromPlaylist = (playlistId: number, filmDbId: number) => {
        // window.dispatchEvent(new CustomEvent('showToast', { detail: { message: `Film berhasil dihapus dari playlist.`, type: 'success' } }));
        if (currentSelectedPlaylist && currentSelectedPlaylist.id === playlistId) {
            refreshCurrentSelectedPlaylist(playlistId);
        }
        refreshAllPlaylistsForOverview();
    };

    // Listener untuk Toast dari komponen anak (jika tidak menggunakan flash session)
    useEffect(() => {
        const handleShowToast = (event: Event) => {
            const customEvent = event as CustomEvent<{ message: string; type: 'success' | 'error' }>;
            // Di sini Anda akan memanggil fungsi untuk menampilkan toast global
            // Misalnya, jika Anda menggunakan state di AuthenticatedLayout:
            // (AuthenticatedLayout akan punya state toast dan komponen ToastNotification)
            // Untuk sekarang, kita bisa dispatch event lagi ke parent atau handle di sini jika Toast ada di Dashboard.tsx
            // Atau, biarkan AuthenticatedLayout yang menangani flash props dari Inertia.
            // Jika ingin toast dari aksi axios murni, perlu sistem toast global.
            (window as any).setAppToast?.(customEvent.detail.message, customEvent.detail.type);
        };
        window.addEventListener('showToast', handleShowToast);
        return () => window.removeEventListener('showToast', handleShowToast);
    }, []);

    return (
        <AuthenticatedLayout
            user={user}
            header={
                <h2 className="text-xl leading-tight font-semibold text-gray-200">
                    {currentSelectedPlaylist ? `${currentSelectedPlaylist.name}` : 'Semua Playlist'}
                </h2>
            }
            onCreateNewPlaylist={() => setIsCreatePlaylistModalOpen(true)}
        >
            <Head title={currentSelectedPlaylist ? currentSelectedPlaylist.name : 'Dashboard'} />

            <div className="py-0">
                {' '}
                {/* Padding sudah dihandle oleh main content di AuthenticatedLayout */}
                {currentSelectedPlaylist ? (
                    <PlaylistDetailView
                        key={currentSelectedPlaylist.id}
                        playlist={currentSelectedPlaylist}
                        onOpenAddFilmModal={() => openAddFilmModal(currentSelectedPlaylist)}
                        onFilmCardClick={openFilmOverviewModal}
                        onRatingUpdated={handleRatingUpdated}
                        onFilmRemoved={(filmDbId) => handleFilmRemovedFromPlaylist(currentSelectedPlaylist.id, filmDbId)}
                        onPlaylistDetailsUpdated={handlePlaylistUpdated}
                        onPlaylistDeleted={(playlistName) => handlePlaylistDeleted(currentSelectedPlaylist.id, playlistName.toString())}
                    />
                ) : (
                    <PlaylistOverview
                        playlists={allPlaylistsForOverview}
                        onViewPlaylist={(playlistId) => router.visit(route('playlist.show', { playlist: playlistId }))}
                        onCreateNewPlaylist={() => setIsCreatePlaylistModalOpen(true)}
                    />
                )}
            </div>

            {/* Modals */}
            <CreatePlaylistModal
                isOpen={isCreatePlaylistModalOpen}
                onClose={() => {
                    setIsCreatePlaylistModalOpen(false);
                    if (showCreatePlaylistModalFromUrl) {
                        router.visit(route('dashboard'), { preserveState: true, preserveScroll: true, replace: true });
                    }
                }}
                // onPlaylistCreated={handlePlaylistCreated}
            />

            {selectedFilmForOverview && (
                <FilmOverviewModal
                    filmId={selectedFilmForOverview.imdb_id}
                    initialFilmData={selectedFilmForOverview}
                    isOpen={isFilmOverviewModalOpen}
                    onClose={() => setIsFilmOverviewModalOpen(false)}
                    userPlaylists={userPlaylistsForModal}
                    onRatingUpdated={handleRatingUpdated}
                    onFilmAddedToDifferentPlaylist={(playlistId, filmData) => {
                        handleFilmAddedToPlaylist(playlistId, filmData); // Gunakan handler yang sama
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
