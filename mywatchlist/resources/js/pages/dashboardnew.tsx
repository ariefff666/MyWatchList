import MovieTable from '@/components/common/MovieTable';
import Navbar from '@/components/common/Navbar';
import PlaylistCardNew from '@/components/common/PlaylistCardNew';
import { PlusIcon } from '@heroicons/react/24/solid';
import React from 'react';
import Button from '../components/common/Button';

// --- Data Dummy (pindahkan ke file terpisah atau fetch dari API nantinya) ---
interface Movie {
    id: string;
    title: string;
    posterUrl: string;
    year?: string;
    imdbRating?: number;
    userRating?: number | null;
}

interface Playlist {
    id: string;
    name: string;
    movies: Movie[];
    description?: string;
}

const dummyPlaylists: Playlist[] = [
    {
        id: '1',
        name: 'Sudah Ditonton',
        description: 'Koleksi film dan serial yang telah selesai saya tonton.',
        movies: [
            {
                id: 'tt0111161',
                title: 'The Shawshank Redemption',
                posterUrl:
                    'https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg',
                year: '1994',
                imdbRating: 9.3,
                userRating: 5,
            },
            {
                id: 'tt0468569',
                title: 'The Dark Knight',
                posterUrl: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg',
                year: '2008',
                imdbRating: 9.0,
                userRating: 5,
            },
            {
                id: 'tt1375666',
                title: 'Inception',
                posterUrl: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg',
                year: '2010',
                imdbRating: 8.8,
                userRating: 4,
            },
            {
                id: 'tt0816692',
                title: 'Interstellar',
                posterUrl:
                    'https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg',
                year: '2014',
                imdbRating: 8.7,
            },
            {
                id: 'tt0108052',
                title: "Schindler's List",
                posterUrl:
                    'https://m.media-amazon.com/images/M/MV5BNDE4OTMxMTctNmRhYy00NWE2LTg3YzltYzg4ZWNhYzEyMGNkXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg',
                year: '1993',
                imdbRating: 9.0,
            },
            {
                id: 'tt0167260',
                title: 'The Lord of the Rings: The Return of the King',
                posterUrl:
                    'https://m.media-amazon.com/images/M/MV5BNzA5ZDNlZWMtM2NhNS00NDJjLTk4NDItYTRmY2EwMWZlMTY3XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg',
                year: '2003',
                imdbRating: 9.0,
            },
        ],
    },
    {
        id: '2',
        name: 'Ingin Ditonton',
        description: 'Daftar film dan serial yang jadi prioritas tontonan berikutnya.',
        movies: [
            {
                id: 'tt9419884',
                title: 'Doctor Strange in the Multiverse of Madness',
                posterUrl:
                    'https://m.media-amazon.com/images/M/MV5BNWM0ZGJlMzMtZmYwMi00NzI3LTgzMzMtNjMzNjliNDRmZmFlXkEyXkFqcGdeQXVyMTM1MTE1NDMx._V1_SX300.jpg',
                year: '2022',
                imdbRating: 6.9,
            },
            {
                id: 'tt1877830',
                title: 'The Batman',
                posterUrl:
                    'https://m.media-amazon.com/images/M/MV5BMDdmMTBiNTYtMDIzNi00NGVlLWIzMDYtZTk3MTQ3NGQxZGEwXkEyXkFqcGdeQXVyMzMwOTU5MDk@._V1_SX300.jpg',
                year: '2022',
                imdbRating: 7.8,
            },
            {
                id: 'tt1160419',
                title: 'Dune: Part Two',
                posterUrl:
                    'https://m.media-amazon.com/images/M/MV5BN2Q3ZGY3ZmEtZTVjMS00YmZhLTg4M2YtZWFmMzNhNTMyZDYzXkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_SX300.jpg',
                year: '2024',
                imdbRating: 8.8,
                userRating: null,
            },
        ],
    },
    {
        id: '5',
        name: 'Sedang Ditonton',
        description: 'Serial atau film yang belum selesai ditonton.',
        movies: [
            {
                id: 'tt4574334',
                title: 'Stranger Things',
                posterUrl:
                    'https://m.media-amazon.com/images/M/MV5BMDZkYmVhNjMtNWU4MC00MDQxLWE3MjYtZGMzNWI1ZjhlOWJmXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_SX300.jpg',
                year: '2016-',
                imdbRating: 8.7,
            },
        ],
    },
    {
        id: '3',
        name: 'Film Barat Favorit',
        description: 'Kompilasi film-film Hollywood yang paling berkesan.',
        movies: [
            {
                id: 'tt0120338',
                title: 'Titanic',
                posterUrl:
                    'https://m.media-amazon.com/images/M/MV5BMDdmZGU3NDQtY2E5My00ZTliLWIzOTUtMTY4ZGI1YjdiNjk3XkEyXkFqcGdeQXVyNTA4NzY1MzY@._V1_SX300.jpg',
                year: '1997',
                imdbRating: 7.9,
                userRating: 4,
            },
            {
                id: 'tt0109830',
                title: 'Forrest Gump',
                posterUrl:
                    'https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg',
                year: '1994',
                imdbRating: 8.8,
            },
        ],
    },
    {
        id: '4',
        name: 'Anime & Film Jepang',
        description: 'Tontonan dari negeri sakura, baik animasi maupun live-action.',
        movies: [
            {
                id: 'tt5311514',
                title: 'Your Name. (Kimi no Na wa.)',
                posterUrl:
                    'https://m.media-amazon.com/images/M/MV5BODRmZDVmNzUtZDA4ZC00NjhkLWI2M2UtN2M0ZDIzNDcxYThjL2ltYWdlXkEyXkFqcGdeQXVyNTk0MzMzODA@._V1_SX300.jpg',
                year: '2016',
                imdbRating: 8.4,
                userRating: 5,
            },
            {
                id: 'tt0245429',
                title: 'Spirited Away',
                posterUrl:
                    'https://m.media-amazon.com/images/M/MV5BMjlmZmI5MDctNDE2YS00YWE0LWE5ZWItZDBhYWQ0NTcxNWRhXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg',
                year: '2001',
                imdbRating: 8.6,
            },
            {
                id: 'tt1136617',
                title: 'Okuribito (Departures)',
                posterUrl: 'https://m.media-amazon.com/images/M/MV5BMTQ1OTMxMDY0Nl5BMl5BanBnXkFtZTcwNDQ1MDU4Mg@@._V1_SX300.jpg',
                year: '2008',
                imdbRating: 8.0,
            },
        ],
    },
];
// --- End Data Dummy ---

const DashboardPage: React.FC = () => {
    // Di sini Anda akan fetch data playlist user dari API
    const playlists = dummyPlaylists; // Gunakan data dummy untuk sekarang

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100">
            <Navbar />

            <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col items-center justify-between sm:flex-row">
                    <h1 className="mb-4 text-3xl font-bold text-white sm:mb-0">Playlist Saya</h1>
                    <Button
                        variant="primary"
                        size="md"
                        // onClick={() => {/* Logika buka modal buat playlist baru */}}
                    >
                        <PlusIcon className="mr-2 h-5 w-5" />
                        Buat Playlist Baru
                    </Button>
                </div>

                {playlists.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:gap-8">
                        {playlists.map((playlist) => (
                            <PlaylistCardNew key={playlist.id} playlist={playlist} />
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path
                                vectorEffect="non-scaling-stroke"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                            />
                        </svg>
                        <h3 className="mt-2 text-xl font-medium text-white">Belum ada playlist</h3>
                        <p className="mt-1 text-sm text-slate-400">Mulai buat playlist pertamamu sekarang.</p>
                        <div className="mt-6">
                            <Button
                                variant="primary"
                                // onClick={() => {/* Logika buka modal buat playlist baru */}}
                            >
                                <PlusIcon className="mr-2 h-5 w-5" />
                                Buat Playlist
                            </Button>
                        </div>
                    </div>
                )}
                <div className="min-h-screen bg-white text-gray-900">
                    <MovieTable />
                </div>
            </main>

            <footer className="mt-12 border-t border-slate-700/50 bg-slate-900">
                <div className="container mx-auto px-4 py-6 text-center text-sm text-slate-400 sm:px-6 lg:px-8">
                    &copy; {new Date().getFullYear()} PlayLister. Dibuat dengan ❤️.
                </div>
            </footer>
        </div>
    );
};

export default DashboardPage;
