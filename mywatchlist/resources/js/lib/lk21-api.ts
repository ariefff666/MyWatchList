// src/api/lk21Api.ts
import axios from 'axios';

const BASE_URL = 'https://api-lk21.herokuapp.com/api/v1';

export const getLatestMovies = async (page = 1) => {
    const res = await axios.get(`http://127.0.0.1:8000/proxy/lk21/latest?page=${page}`);
    return res.data;
};

export const searchMovies = async (query: string) => {
    const res = await axios.get(`${BASE_URL}/search?q=${query}`);
    return res.data;
};

// Tambahkan sesuai kebutuhan:
// getMoviesByGenre, getMoviesByYear, getTrendingMovies, etc.
