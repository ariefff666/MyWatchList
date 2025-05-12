import FilmDetailView from '@/components/details/FIlmDetailView';
import { usePage } from '@inertiajs/react';

export default function MovieDetailPage() {
    const { props } = usePage();
    const imdbID = props.imdbID as string;

    if (!imdbID) return <p>IMDb ID tidak ditemukan.</p>;

    return <FilmDetailView imdbID={imdbID} />;
}
