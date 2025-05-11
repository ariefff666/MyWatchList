import { ApplicationLogo } from '@/components/common/AplicationLogo';
import { NavLink } from '@/components/common/NavLink';
import { PageProps as BasePageProps, Playlist, User } from '@/types';
import { ArrowLeftOnRectangleIcon, Bars3Icon, Cog6ToothIcon, HomeIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Link, usePage } from '@inertiajs/react';
import axios from 'axios'; // Untuk fetch playlist di sidebar
import React, { PropsWithChildren, useEffect, useState } from 'react';

// Definisikan props spesifik untuk layout ini jika ada, selain dari PageProps
interface AuthenticatedLayoutProps extends PropsWithChildren {
    header?: React.ReactNode; // Untuk judul halaman
    user: User; // User object dari auth prop
    onCreateNewPlaylist?: () => void;
}

export default function AuthenticatedLayout({ user, header, children, onCreateNewPlaylist }: AuthenticatedLayoutProps) {
    const { props } = usePage<BasePageProps>(); // Akses props global Inertia
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default sidebar terbuka di desktop
    const [userPlaylists, setUserPlaylists] = useState<Pick<Playlist, 'id' | 'name' | 'films_count'>[]>([]);
    const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(true);

    // Fungsi untuk toggle sidebar
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    // Fetch playlist pengguna untuk sidebar
    useEffect(() => {
        setIsLoadingPlaylists(true);
        axios
            .get(route('api.playlists.index')) // Menggunakan endpoint API yang kita buat
            .then((response) => {
                setUserPlaylists(response.data);
            })
            .catch((error) => {
                console.error('Error fetching user playlists for sidebar:', error);
                // Handle error, mungkin tampilkan pesan
            })
            .finally(() => {
                setIsLoadingPlaylists(false);
            });
    }, []); // Jalankan sekali saat komponen dimuat

    // Menutup sidebar di layar kecil saat navigasi
    useEffect(() => {
        const handleRouteChange = () => {
            if (window.innerWidth < 768 && isSidebarOpen) {
                // md breakpoint Tailwind
                setIsSidebarOpen(false);
            }
        };
        window.addEventListener('inertia:navigate', handleRouteChange);

        return () => {
            window.removeEventListener('inertia:navigate', handleRouteChange);
        };
    }, [isSidebarOpen]);

    // Menampilkan pesan flash
    useEffect(() => {
        const { flash } = props;
        if (flash?.success) {
            // Implementasikan toast/alert di sini, contoh:
            alert(`Sukses: ${flash.success}`); // Ganti dengan komponen Toast/Alert yang lebih baik
        }
        if (flash?.error) {
            alert(`Error: ${flash.error}`);
        }
        if (flash?.message && !flash.success && !flash.error) {
            alert(flash.message);
        }
    }, [props.flash]);

    return (
        <div className="flex min-h-screen bg-gray-900 text-gray-100">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 flex-shrink-0 overflow-y-auto bg-gray-800 shadow-2xl transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64 md:w-72' : 'w-0 -translate-x-full md:w-20'} md:relative md:translate-x-0`} // Sidebar tetap di desktop
            >
                <div className={`flex h-full flex-col ${isSidebarOpen || 'md:items-center'} p-4`}>
                    {/* Logo dan Nama Aplikasi */}
                    <div className={`mb-8 text-center ${isSidebarOpen ? '' : 'md:py-4'}`}>
                        <Link href={route('dashboard')} className="flex items-center justify-center">
                            <ApplicationLogo className={`block h-10 w-auto fill-current text-blue-500 ${isSidebarOpen ? 'mr-2' : 'md:h-8'}`} />
                            {isSidebarOpen && (
                                <span className="text-2xl font-bold text-white">
                                    My<span className="text-blue-500">Watch</span>List
                                </span>
                            )}
                        </Link>
                        {isSidebarOpen && user && <p className="mt-1 text-xs text-gray-400">Halo, {user.name}!</p>}
                    </div>

                    {/* Tombol Toggle Sidebar (hanya muncul di mode 'collapsed' di desktop) */}
                    <button
                        onClick={toggleSidebar}
                        className="absolute top-5 right-[-12px] z-40 rounded-full bg-blue-600 p-1.5 text-white hover:bg-blue-700 md:hidden"
                        title={isSidebarOpen ? 'Tutup Sidebar' : 'Buka Sidebar'}
                    >
                        {isSidebarOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
                    </button>

                    {/* Navigasi Utama */}
                    <nav className="flex-grow space-y-2">
                        <NavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                            className={`flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${isSidebarOpen ? '' : 'md:justify-center'} ${
                                route().current('dashboard') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            <HomeIcon className={`h-5 w-5 ${isSidebarOpen ? 'mr-3' : 'md:mr-0'}`} />
                            {isSidebarOpen && <span>Dashboard</span>}
                            {!isSidebarOpen && <span className="sr-only">Dashboard</span>}
                        </NavLink>

                        {/* Contoh NavLink lain jika diperlukan */}
                        {/* <NavLink href="#" active={false} className="...">...</NavLink> */}

                        {/* Tombol Buat Playlist Baru - akan membuka modal */}
                        <button
                            onClick={onCreateNewPlaylist}
                            className={`flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 transition-colors duration-150 hover:bg-gray-700 hover:text-white ${isSidebarOpen ? '' : 'md:justify-center'}`}
                        >
                            <PlusIcon className={`h-5 w-5 ${isSidebarOpen ? 'mr-3' : 'md:mr-0'}`} />
                            {isSidebarOpen && <span>Buat Playlist Baru</span>}
                            {!isSidebarOpen && <span className="sr-only">Buat Playlist Baru</span>}
                        </button>

                        {/* Daftar Playlist Pengguna */}
                        {isSidebarOpen && (
                            <div className="mt-4 border-t border-gray-700 pt-4">
                                <h3 className="mb-2 px-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">Playlist Saya</h3>
                                <div className="max-h-60 space-y-1 overflow-y-auto pr-1">
                                    {' '}
                                    {/* Batasi tinggi dan aktifkan scroll */}
                                    {isLoadingPlaylists ? (
                                        <p className="px-3 text-xs text-gray-400">Memuat playlist...</p>
                                    ) : userPlaylists.length > 0 ? (
                                        userPlaylists.map((playlist) => (
                                            <NavLink
                                                key={playlist.id}
                                                href={route('dashboard', { playlist_id: playlist.id })} // Navigasi ke dashboard dengan query param
                                                active={route().current('dashboard', { playlist_id: playlist.id })}
                                                className={`block w-full truncate rounded-md px-3 py-2 text-left text-xs ${
                                                    route().current('dashboard', { playlist_id: playlist.id })
                                                        ? 'bg-blue-500 font-semibold text-white'
                                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                                }`}
                                            >
                                                {playlist.name} ({playlist.films_count || 0})
                                            </NavLink>
                                        ))
                                    ) : (
                                        <p className="px-3 text-xs text-gray-400">Belum ada playlist.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </nav>

                    {/* Navigasi Bawah (Settings, Logout) */}
                    <div className={`mt-auto space-y-2 border-t border-gray-700 pt-4 ${isSidebarOpen ? '' : 'md:space-y-4'}`}>
                        <NavLink
                            href={route('profile.edit')}
                            active={route().current('profile.edit')}
                            className={`group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${isSidebarOpen ? '' : 'md:justify-center'} ${
                                route().current('profile.edit') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            <Cog6ToothIcon className={`h-5 w-5 ${isSidebarOpen ? 'mr-3' : 'md:mr-0'}`} />
                            {isSidebarOpen && <span>Pengaturan Akun</span>}
                            {!isSidebarOpen && <span className="sr-only">Pengaturan Akun</span>}
                        </NavLink>

                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className={`group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 transition-colors duration-150 hover:bg-red-600 hover:text-white ${isSidebarOpen ? '' : 'md:justify-center'}`}
                        >
                            <ArrowLeftOnRectangleIcon className={`h-5 w-5 group-hover:text-white ${isSidebarOpen ? 'mr-3' : 'md:mr-0'}`} />
                            {isSidebarOpen && <span>Logout</span>}
                            {!isSidebarOpen && <span className="sr-only">Logout</span>}
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Konten Utama */}
            <div className="flex w-full flex-1 flex-col">
                {/* Navbar Atas (untuk mobile dan judul halaman) */}
                <header className="sticky top-0 z-20 bg-gray-800 shadow-md md:hidden">
                    {' '}
                    {/* Hanya tampil di mobile, atau bisa juga untuk desktop */}
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center">
                                <button
                                    onClick={toggleSidebar}
                                    className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white focus:outline-none"
                                >
                                    {isSidebarOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                                </button>
                                {header && <div className="ml-3 text-lg font-semibold text-white">{header}</div>}
                            </div>

                            {/* User dropdown di mobile (jika diperlukan) */}
                            <div className="hidden sm:ml-6 sm:flex sm:items-center">{/* Notifikasi atau user menu bisa di sini */}</div>
                        </div>
                    </div>
                </header>

                {/* Judul Halaman untuk Desktop (jika header prop diberikan) */}
                {header && (
                    <div className="sticky top-0 z-10 hidden bg-gray-800 shadow md:block">
                        <div className="mx-auto flex max-w-full items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
                            <div className="text-xl font-semibold text-white">{header}</div>
                            {/* Bisa tambahkan tombol aksi global di sini */}
                        </div>
                    </div>
                )}

                {/* Konten Halaman */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">{children}</main>

                {/* Footer (Opsional) */}
                {/* <footer className="bg-gray-800 text-center p-4 text-xs text-gray-500 border-t border-gray-700">
                    © {new Date().getFullYear()} FilmLister. All rights reserved.
                </footer> */}
            </div>

            {/* Overlay untuk sidebar di mobile */}
            {isSidebarOpen && <div onClick={toggleSidebar} className="fixed inset-0 z-20 bg-black opacity-50 md:hidden" aria-hidden="true"></div>}
        </div>
    );
}
