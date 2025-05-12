import { ApplicationLogo } from '@/components/common/AplicationLogo';
import { NavLink } from '@/components/common/NavLink';
import { PageProps as BasePageProps, Playlist, User } from '@/types';
import {
    ArrowLeftOnRectangleIcon,
    Bars3Icon,
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
    Cog6ToothIcon,
    HomeIcon,
    PlusIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { Link, router, usePage } from '@inertiajs/react';
import React, { PropsWithChildren, useEffect, useRef, useState } from 'react';
// import Dropdown from '@/Components/Dropdown'; // Jika Anda menggunakan dropdown untuk user menu di header
import { ToastContainer, showToast as globalShowToast } from '@/components/common/ToastNotification';
import { Transition } from '@headlessui/react';
import axios from 'axios';

interface AuthenticatedLayoutProps extends PropsWithChildren {
    header?: React.ReactNode;
    user: User;
    onCreateNewPlaylist?: () => void;
}

export default function AuthenticatedLayout({ user, header, children, onCreateNewPlaylist }: AuthenticatedLayoutProps) {
    const { props } = usePage<BasePageProps>();
    const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [userPlaylists, setUserPlaylists] = useState<Pick<Playlist, 'id' | 'name' | 'films_count'>[]>([]);
    const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(true);

    const mainContentRef = useRef<HTMLDivElement>(null);

    const toggleDesktopSidebar = () => setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed);
    const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);

    const fetchPlaylistsForSidebar = () => {
        setIsLoadingPlaylists(true);
        axios
            .get(route('api.playlists.index'))
            .then((response) => setUserPlaylists(response.data))
            .catch((error) => console.error('Error fetching user playlists for sidebar:', error))
            .finally(() => setIsLoadingPlaylists(false));
    };

    useEffect(() => {
        fetchPlaylistsForSidebar();
        const handleRefreshSidebarPlaylists = () => fetchPlaylistsForSidebar();
        window.addEventListener('refreshSidebarPlaylists', handleRefreshSidebarPlaylists);
        return () => window.removeEventListener('refreshSidebarPlaylists', handleRefreshSidebarPlaylists);
    }, []);

    useEffect(() => {
        const { flash } = props;
        if (flash) {
            if (flash.success) globalShowToast(flash.success, 'success');
            else if (flash.error) globalShowToast(flash.error, 'error');
            else if (flash.message) globalShowToast(flash.message, 'info');
        }
    }, [props.flash]);

    useEffect(() => {
        const handleRouteChange = () => {
            if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
        };
        router.on('navigate', handleRouteChange);
        // return () => router.off('navigate', handleRouteChange);
    }, [isMobileSidebarOpen]);

    const page = usePage();
    const currentUrl = page.url; // misal: /dashboard/playlist/abc123
    const match = currentUrl.match(/playlist\/([^/?#]+)/);
    const currentPathPlaylistId = match ? match[1] : null;

    const commonSidebarNavItems = (isMobile = false) => (
        <>
            <NavLink
                href={route('dashboard')}
                active={route().current('dashboard') && !currentPathPlaylistId}
                className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium ${isMobile || !isDesktopSidebarCollapsed ? '' : 'justify-center'} ${route().current('dashboard') && !currentPathPlaylistId ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                title="Dashboard"
            >
                <HomeIcon className={`h-5 w-5 ${isMobile || !isDesktopSidebarCollapsed ? 'mr-3' : 'mr-0'}`} />
                {(isMobile || !isDesktopSidebarCollapsed) && <span>Dashboard</span>}
            </NavLink>
            <button
                onClick={onCreateNewPlaylist}
                className={`flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white ${isMobile || !isDesktopSidebarCollapsed ? '' : 'justify-center'}`}
                title="Buat Playlist Baru"
            >
                <PlusIcon className={`h-5 w-5 ${isMobile || !isDesktopSidebarCollapsed ? 'mr-3' : 'mr-0'}`} />
                {(isMobile || !isDesktopSidebarCollapsed) && <span>Buat Playlist</span>}
            </button>
        </>
    );

    const commonSidebarPlaylistSection = (isMobile = false) => (
        <div
            className={`custom-scrollbar mt-3 flex-grow border-t border-gray-700 pt-3 ${isMobile || !isDesktopSidebarCollapsed ? 'pr-1' : 'w-full space-y-1'} ${!isDesktopSidebarCollapsed ? 'overflow-y-scroll' : 'overflow-x-hidden overflow-y-hidden'}`}
        >
            {(isMobile || !isDesktopSidebarCollapsed) && (
                <h3 className="sticky top-0 z-10 mb-2 bg-gray-800 px-3 py-1 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Playlist Saya
                </h3>
            )}
            {isDesktopSidebarCollapsed && !isMobile && userPlaylists.length > 0 && (
                <h3 className="mb-1 px-1 text-center text-[10px] font-semibold text-gray-500 uppercase">PLAYLIST</h3>
            )}
            {isLoadingPlaylists ? (
                <p className={`text-xs text-gray-400 ${isMobile || !isDesktopSidebarCollapsed ? 'px-3' : 'px-1 text-center'}`}>Memuat...</p>
            ) : userPlaylists.length > 0 ? (
                userPlaylists.map((playlist) => (
                    <NavLink
                        key={playlist.id}
                        href={route('playlist.show', { playlist: playlist.id })}
                        active={currentPathPlaylistId === playlist.id.toString()}
                        className={`block w-full truncate rounded-md px-3 py-1.5 text-left text-xs ${isMobile || !isDesktopSidebarCollapsed ? '' : 'flex justify-center py-2'} ${currentPathPlaylistId === playlist.id.toString() ? 'bg-blue-500 font-semibold text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                        title={playlist.name}
                        onClick={() => {
                            if (isMobile) toggleMobileSidebar();
                        }}
                    >
                        {isMobile || !isDesktopSidebarCollapsed ? (
                            <>
                                {playlist.name} <span>({playlist.films_count || 0})</span>
                            </>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                                <path d="M3.505 2.365A4.5 4.5 0 0 1 7.75 2a4.5 4.5 0 0 1 4.245.365A2.25 2.25 0 0 0 10.25 1h-.5A2.25 2.25 0 0 0 6 2.25v.51A2.5 2.5 0 0 0 3.5 5.5v7A2.5 2.5 0 0 0 6 15V6.25A2.25 2.25 0 0 1 8.25 4h3.5A2.25 2.25 0 0 1 14 6.25V15a2.5 2.5 0 0 0 2.5 2.5h.01a2.5 2.5 0 0 0 2.49-2.5v-7A2.5 2.5 0 0 0 16.5 5.5v-.51A2.25 2.25 0 0 0 14.75 3h-.5A2.25 2.25 0 0 0 12.5 1.75A4.5 4.5 0 0 1 16.75 2a4.5 4.5 0 0 1 4.245-.365A2.25 2.25 0 0 0 19.25 1h-.5A2.25 2.25 0 0 0 17 2.25v.51A2.5 2.5 0 0 0 14.5 5.5v7a2.5 2.5 0 0 0 2.5 2.5H17a2.5 2.5 0 0 0 2.5-2.5v-7a2.5 2.5 0 0 0-2.5-2.5V3.25A2.25 2.25 0 0 1 14.75 1h-2.5A2.25 2.25 0 0 1 10 3.25V15a2.5 2.5 0 0 0 2.5 2.5h.01a2.5 2.5 0 0 0 2.49-2.5v-7A2.5 2.5 0 0 0 12.5 5.5v-.51A2.25 2.25 0 0 0 10.75 3h-.5A2.25 2.25 0 0 0 8.5 1.75A4.5 4.5 0 0 1 12.75 2a4.5 4.5 0 0 1 4.245-.365A2.25 2.25 0 0 0 15.25 1h-.5A2.25 2.25 0 0 0 13 2.25v.51A2.5 2.5 0 0 0 10.5 5.5v7a2.5 2.5 0 0 0 2.5 2.5H13a2.5 2.5 0 0 0 2.5-2.5v-7a2.5 2.5 0 0 0-2.5-2.5V3.25A2.25 2.25 0 0 1 10.75 1h-1.5A2.25 2.25 0 0 1 7 3.25V15a2.5 2.5 0 0 0 2.5 2.5h.01a2.5 2.5 0 0 0 2.49-2.5v-7A2.5 2.5 0 0 0 9.5 5.5v-.51A2.25 2.25 0 0 0 7.75 3h-.5A2.25 2.25 0 0 0 5.5 1.75A4.5 4.5 0 0 1 9.75 2a4.5 4.5 0 0 1 4.245-.365A2.25 2.25 0 0 0 12.25 1h-.5A2.25 2.25 0 0 0 10 2.25v.51A2.5 2.5 0 0 0 7.5 5.5v7a2.5 2.5 0 0 0 2.5 2.5H10a2.5 2.5 0 0 0 2.5-2.5v-7a2.5 2.5 0 0 0-2.5-2.5V3.25A2.25 2.25 0 0 1 7.75 1h-1.5A2.25 2.25 0 0 1 4 3.25V15a2.5 2.5 0 0 0 2.5 2.5h.01a2.5 2.5 0 0 0 2.49-2.5v-7A2.5 2.5 0 0 0 6.5 5.5v-.51A2.25 2.25 0 0 0 4.75 3h-.5A2.25 2.25 0 0 0 2.5 1.75A4.5 4.5 0 0 1 6.75 2a4.5 4.5 0 0 1 4.245-.365A2.25 2.25 0 0 0 9.25 1h-.5A2.25 2.25 0 0 0 7 2.25v.51A2.5 2.5 0 0 0 4.5 5.5v7a2.5 2.5 0 0 0 2.5 2.5H7a2.5 2.5 0 0 0 2.5-2.5v-7a2.5 2.5 0 0 0-2.5-2.5V3.25A2.25 2.25 0 0 1 4.75 1h-1.25Z" />
                            </svg>
                        )}
                    </NavLink>
                ))
            ) : (
                <p className={`text-xs text-gray-400 ${isMobile || !isDesktopSidebarCollapsed ? 'px-3' : 'px-1 text-center'}`}>Belum ada playlist.</p>
            )}
        </div>
    );

    const commonSidebarBottomNav = (isMobile = false) => (
        <>
            <NavLink
                href={route('profile.edit')}
                active={route().current('profile.edit')}
                className={`flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium ${isMobile || !isDesktopSidebarCollapsed ? '' : 'justify-center'} ${route().current('profile.edit') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                title="Pengaturan"
                onClick={() => {
                    if (isMobile) toggleMobileSidebar();
                }}
            >
                <Cog6ToothIcon className={`h-5 w-5 ${isMobile || !isDesktopSidebarCollapsed ? 'mr-3' : 'mr-0'}`} />
                {(isMobile || !isDesktopSidebarCollapsed) && <span>Pengaturan</span>}
            </NavLink>
            {isMobile && ( // Hanya tampilkan logout di mobile sidebar bawah
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-red-600 hover:text-white"
                    title="Logout"
                    onClick={toggleMobileSidebar}
                >
                    <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5 group-hover:text-white" />
                    <span>Logout</span>
                </Link>
            )}
        </>
    );

    return (
        <div className="flex h-screen flex-col bg-gray-900 text-gray-100">
            {/* Header Utama Aplikasi - Sticky */}
            <header className="sticky top-0 z-40 w-full bg-gray-800 shadow-md">
                <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center">
                            <button onClick={toggleMobileSidebar} className="mr-2 md:hidden ...">
                                <Bars3Icon className="h-6 w-6" />
                            </button>
                            <button onClick={toggleDesktopSidebar} className="hidden md:inline-flex ...">
                                {isDesktopSidebarCollapsed ? (
                                    <ChevronDoubleRightIcon className="h-5 w-5" />
                                ) : (
                                    <ChevronDoubleLeftIcon className="h-5 w-5" />
                                )}
                            </button>
                            <Link href={route('dashboard')} className="ml-2 flex flex-shrink-0 items-center">
                                <ApplicationLogo className="mr-2 block h-8 w-auto fill-current text-blue-500" />
                                <span className="hidden text-xl font-bold text-white sm:inline">
                                    My<span className="text-blue-500">Watch</span>List
                                </span>
                            </Link>
                        </div>
                        <div className="flex flex-grow justify-center px-4">
                            {header && <div className="truncate text-lg font-semibold text-white">{header}</div>}
                        </div>
                        <div className="flex items-center">
                            {/* User Menu untuk Desktop - Hilangkan Settings & Logout dari sini jika sudah ada di sidebar bawah */}
                            <span className="mr-3 hidden text-sm text-gray-300 md:block">Halo, {user.name}</span>
                            {/* Ikon Settings dan Logout di header utama sekarang HANYA untuk Desktop jika sidebar collapsed */}
                            {/* Atau bisa dihilangkan sama sekali dari header jika selalu ada di sidebar bawah */}
                            <Link
                                href={route('profile.edit')}
                                className="hidden rounded-full p-2 hover:bg-gray-700 md:inline-flex"
                                title="Pengaturan"
                            >
                                <Cog6ToothIcon className="h-6 w-6 text-gray-400 hover:text-white" />
                            </Link>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="ml-1 hidden rounded-full p-2 hover:bg-gray-700 md:inline-flex"
                                title="Logout"
                            >
                                <ArrowLeftOnRectangleIcon className="h-6 w-6 text-gray-400 hover:text-red-500" />
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Desktop Fixed */}
                <aside
                    className={`z-30 hidden flex-shrink-0 flex-col bg-gray-800 shadow-lg transition-all duration-300 ease-in-out md:flex ${isDesktopSidebarCollapsed ? 'w-20' : 'w-72'} h-[calc(100vh-4rem)]`} // Tinggi sidebar = tinggi viewport - tinggi header
                >
                    <div className={`flex h-full flex-col ${isDesktopSidebarCollapsed ? 'items-center' : ''} overflow-y-hidden p-3 md:p-4`}>
                        <nav className="flex w-full flex-grow flex-col space-y-1.5 overflow-hidden">
                            {commonSidebarNavItems()}
                            {commonSidebarPlaylistSection()}
                        </nav>
                        <div
                            className={`mt-auto w-full space-y-1.5 border-t border-gray-700 pt-3 ${isDesktopSidebarCollapsed ? 'md:space-y-3' : ''}`}
                        >
                            {commonSidebarBottomNav()}
                            {/* Tombol Logout untuk Desktop jika sidebar tidak collapsed */}
                            {!isDesktopSidebarCollapsed && (
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-red-600 hover:text-white"
                                    title="Logout"
                                >
                                    <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5 group-hover:text-white" />
                                    <span>Logout</span>
                                </Link>
                            )}
                            {/* Tombol Logout untuk Desktop jika sidebar collapsed (hanya ikon) */}
                            {isDesktopSidebarCollapsed && (
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="group flex w-full items-center justify-center rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-red-600 hover:text-white"
                                    title="Logout"
                                >
                                    <ArrowLeftOnRectangleIcon className="h-5 w-5 group-hover:text-white" />
                                </Link>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Mobile Sidebar Overlay */}
                <Transition
                    show={isMobileSidebarOpen}
                    as={React.Fragment}
                    // ... (transisi sama seperti sebelumnya)
                >
                    <aside className="fixed inset-y-0 left-0 z-50 flex h-screen w-72 flex-col bg-gray-800 shadow-xl md:hidden">
                        <div className="flex h-full flex-col overflow-y-hidden p-4">
                            {' '}
                            {/* overflow-y-hidden di sini */}
                            <div className="mb-6 flex items-center justify-between">
                                <Link href={route('dashboard')} className="flex items-center">
                                    <ApplicationLogo className="mr-2 block h-9 w-auto fill-current text-blue-500" />
                                    <span className="text-2xl font-bold text-white">
                                        My<span className="text-blue-500">Watch</span>List
                                    </span>
                                </Link>
                                <button onClick={toggleMobileSidebar} className="p-1 text-gray-400 hover:text-white">
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <p className="mb-4 ml-1 text-xs text-gray-400">Halo, {user.name}</p>
                            <nav className="flex flex-grow flex-col space-y-1.5 overflow-hidden">
                                {' '}
                                {/* overflow-hidden di sini */}
                                {commonSidebarNavItems(true)}
                                {commonSidebarPlaylistSection(true)}
                            </nav>
                            <div className="mt-auto space-y-1.5 border-t border-gray-700 pt-3">
                                {commonSidebarBottomNav(true)} {/* Ini akan menampilkan Settings dan Logout */}
                            </div>
                        </div>
                    </aside>
                </Transition>

                {isMobileSidebarOpen && (
                    <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={toggleMobileSidebar} aria-hidden="true"></div>
                )}
                <main ref={mainContentRef} className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:px-8 lg:py-8">
                    {' '}
                    {/* Tambah lg:py-8 */}
                    {children}
                </main>
            </div>
            <ToastContainer />
        </div>
    );
}
