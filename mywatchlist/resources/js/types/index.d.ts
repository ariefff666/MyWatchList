export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface Film {
    // Model Film dari database lokal Anda
    id: number; // ID internal aplikasi
    imdb_id: string;
    title: string;
    year: string | null;
    type: string | null; // 'movie', 'series', 'episode'
    poster_url: string | null;
    plot_short: string | null;
    plot_full: string | null;
    genre: string | null;
    director: string | null;
    actors: string | null;
    runtime: string | null;
    imdb_rating: string | null;
    metascore: string | null;
    other_ratings: Array<{ Source: string; Value: string }> | null; // JSON dari DB
    details_fetched_at: string | null;
    created_at: string;
    updated_at: string;
    current_user_rating?: number | null; // Rating pengguna (1-10), dari accessor di model Film
}

export interface PlaylistFilm extends Film {
    // Film dalam konteks playlist, mungkin ada data pivot
    pivot?: {
        added_at: string;
    };
}

export interface Playlist {
    id: number;
    user_id: number;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    films_count?: number; // Dari withCount
    films?: PlaylistFilm[]; // Film dalam playlist
    film_previews?: Pick<Film, 'id' | 'imdb_id' | 'title' | 'poster_url'>[]; // Untuk preview cepat
    film_poster_previews?: string[]; // Hanya URL poster untuk preview
    updated_at_formatted?: string;
}

export interface UserRating {
    id: number;
    user_id: number;
    film_id: number; // ID internal film
    rating: number; // 1-10
    created_at: string;
    updated_at: string;
}

// --- OMDb API Specific Types ---
export interface OMDbFilmSearchResult {
    Title: string;
    Year: string;
    imdbID: string;
    Type: 'movie' | 'series' | 'episode';
    Poster: string; // URL Poster
}

export interface OMDbSearchResponse {
    Search?: OMDbFilmSearchResult[];
    totalResults?: string;
    Response: 'True' | 'False';
    Error?: string;
}

export interface OMDbRating {
    Source: string;
    Value: string;
}

export interface OMDbFilmDetail {
    Title: string;
    Year: string;
    Rated?: string;
    Released?: string;
    Runtime?: string;
    Genre?: string;
    Director?: string;
    Writer?: string;
    Actors?: string;
    Plot?: string;
    Language?: string;
    Country?: string;
    Awards?: string;
    Poster: string;
    Ratings?: OMDbRating[];
    Metascore?: string;
    imdbRating?: string;
    imdbVotes?: string;
    imdbID: string;
    Type?: string;
    DVD?: string;
    BoxOffice?: string;
    Production?: string;
    Website?: string;
    Response: 'True' | 'False';
    Error?: string;
}

// --- Inertia Page Props ---
// Ini adalah tipe dasar, Anda akan memperluasnya per halaman
export interface PageProps {
    auth: {
        user: User;
    };
    errors: Record<string, string>; // Error validasi dari Laravel
    flash: {
        // Pesan flash dari Laravel session
        success?: string;
        error?: string;
        message?: string; // Alias umum
    };
    [key: string]: unknown;
    // Props spesifik halaman akan ditambahkan menggunakan & (intersection type)
    // Contoh: export interface DashboardPageProps extends PageProps { initialPlaylists: Playlist[] }
}

// --- Props untuk Komponen Umum ---
export interface ChildrenProps {
    children: React.ReactNode;
}

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'; // Ukuran modal
}

// Untuk select options
export interface SelectOption {
    value: string | number;
    label: string;
}
