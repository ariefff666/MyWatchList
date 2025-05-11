// // src/components/common/Sidebar.tsx
// import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
// import { Link, router } from '@inertiajs/react';
// import { LogOut } from 'lucide-react';
// import React from 'react';
// import { Playlist } from '../../types'; // Asumsi path ke tipe data

// interface SidebarProps {
//     playlists: Playlist[];
//     onSelectPlaylist: (playlistId: string | null) => void; // null untuk overview
//     onCreateNewPlaylist: () => void; // Fungsi untuk trigger modal/form buat playlist
//     currentPlaylistId?: string | null;
// }

// const Sidebar: React.FC<SidebarProps> = ({ playlists, onSelectPlaylist, onCreateNewPlaylist, currentPlaylistId }) => {
//     // Tambahkan state untuk user, misal dari context atau props
//     const userName = 'Pengguna Film'; // Ganti dengan nama user asli

//     const cleanup = useMobileNavigation();

//     const handleLogout = () => {
//         cleanup();
//         router.flushAll();
//     };

//     return (
//         <aside className="fixed top-0 left-0 z-40 flex h-screen w-72 flex-col bg-gray-800 p-6 text-white shadow-2xl">
//             <div className="mb-8">
//                 <a href="/dashboard" className="text-2xl font-bold text-white transition-colors duration-300 hover:text-blue-400">
//                     My<span className="text-blue-500">Watch</span>List
//                 </a>
//                 <p className="mt-1 text-sm text-gray-400">Halo, {userName}!</p>
//             </div>

//             <nav className="flex-grow">
//                 <button
//                     onClick={() => onSelectPlaylist(null)} // null untuk kembali ke overview
//                     className={`mb-2 flex w-full items-center rounded-lg px-4 py-3 text-left transition-colors duration-200 hover:bg-gray-700 ${currentPlaylistId === null ? 'bg-blue-600 text-white' : 'text-gray-300'}`}
//                 >
//                     {/* Icon Home/Dashboard */}
//                     <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         strokeWidth={1.5}
//                         stroke="currentColor"
//                         className="mr-3 h-5 w-5"
//                     >
//                         <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5"
//                         />
//                     </svg>
//                     Semua Playlist
//                 </button>

//                 <button
//                     onClick={onCreateNewPlaylist}
//                     className="mb-4 flex w-full items-center rounded-lg px-4 py-3 text-left text-gray-300 transition-colors duration-200 hover:bg-gray-700 hover:text-white"
//                 >
//                     {/* Icon Plus */}
//                     <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         strokeWidth={1.5}
//                         stroke="currentColor"
//                         className="mr-3 h-5 w-5"
//                     >
//                         <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
//                     </svg>
//                     Buat Playlist Baru
//                 </button>

//                 <h3 className="mb-2 text-xs font-semibold text-gray-500 uppercase">Playlist Saya</h3>
//                 <ul className="max-h-[calc(100vh-280px)] space-y-1 overflow-y-auto pr-1">
//                     {' '}
//                     {/* Sesuaikan max-h */}
//                     {playlists.map((playlist) => (
//                         <li key={playlist.id}>
//                             <button
//                                 onClick={() => onSelectPlaylist(playlist.id)}
//                                 className={`w-full rounded-lg px-4 py-2.5 text-left text-sm transition-colors duration-200 hover:bg-gray-700 ${currentPlaylistId === playlist.id ? 'bg-blue-500 font-semibold text-white' : 'text-gray-300'}`}
//                             >
//                                 {playlist.name}
//                             </button>
//                         </li>
//                     ))}
//                 </ul>
//             </nav>

//             <div className="mt-auto">
//                 {/* Tambahkan Link Settings atau Logout di sini */}

//                 <Link
//                     className="flex w-full items-center rounded-lg px-4 py-3 text-left text-gray-300 transition-colors duration-200 hover:bg-gray-700 hover:text-white"
//                     method="post"
//                     href={route('logout')}
//                     as="button"
//                     onClick={handleLogout}
//                 >
//                     <LogOut className="mr-2" />
//                     Log out
//                 </Link>
//             </div>
//         </aside>
//     );
// };

// export default Sidebar;
