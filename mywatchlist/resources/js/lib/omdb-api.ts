import axios from 'axios';

const OMDB_API_KEY = 'a293f2eb';
const BASE_URL = 'http://127.0.0.1:8000/proxy/omdb';

export const searchMovies = async (query: string) => {
    const response = await axios.get(`${BASE_URL}/search?q=${query}`);
    return response.data.Search || [];
};

export async function getFilmDetails(imdbID: string) {
    const response = await fetch(`/proxy/omdb?i=${imdbID}`);
    if (!response.ok) {
        throw new Error('Gagal mengambil detail film');
    }
    return response.json();
}
