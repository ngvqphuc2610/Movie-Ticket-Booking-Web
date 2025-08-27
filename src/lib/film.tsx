import { MovieProps } from '@/components/movies/MovieCard';
import {
    getNowShowingMovies as fetchNowShowingMovies,
    getComingSoonMovies as fetchComingSoonMovies,
    getPopularMovies as fetchPopularMovies,
    getMovieById as fetchMovieById
} from './movieDb';

interface DatabaseMovie {
    id_movie: number;
    title: string;
    original_title: string | null;
    director: string | null;
    actors: string | null;
    duration: number;
    release_date: string;
    end_date: string | null;
    language: string | null;
    subtitle: string | null;
    country: string | null;
    description: string | null;
    poster_image: string | null;
    banner_image: string | null;
    trailer_url: string | null;
    age_restriction: string | null;
    status: 'coming soon' | 'now showing' | 'expired';
    genres?: string[];
}

function formatMovieResponse(movie: DatabaseMovie): MovieProps {
    return {
        id: movie.id_movie.toString(),
        title: movie.title,
        originalTitle: movie.original_title ?? undefined,
        director: movie.director ?? undefined,
        actors: movie.actors ?? undefined,
        duration: movie.duration,
        releaseDate: movie.release_date ? (typeof movie.release_date === 'string' ? movie.release_date : new Date(movie.release_date).toISOString().split('T')[0]) : '',
        endDate: movie.end_date ? (typeof movie.end_date === 'string' ? movie.end_date : new Date(movie.end_date).toISOString().split('T')[0]) : undefined,
        language: movie.language ?? 'Phụ đề',
        subtitle: movie.subtitle ?? undefined,
        country: movie.country ?? 'Việt Nam',
        description: movie.description ?? undefined,
        poster: movie.poster_image ?? '/images/movie-placeholder.jpg',
        banner_image: movie.banner_image ?? undefined,
        trailerUrl: movie.trailer_url ?? undefined,
        ageRestriction: movie.age_restriction ?? 'P',
        status: movie.status ?? 'coming soon',
        genre: Array.isArray(movie.genres) ? movie.genres.join(', ') : undefined,
        genres: movie.genres
    };
}

// Hàm lấy danh sách phim đang chiếu từ Database
export async function getNowShowingMovies(): Promise<MovieProps[]> {
    try {
        const movies = await fetchNowShowingMovies();
        return movies.map(formatMovieResponse);
    } catch (error) {
        console.error("Lỗi khi lấy phim đang chiếu:", error);
        return [];
    }
}

// Hàm lấy danh sách phim sắp chiếu từ Database
export async function getComingSoonMovies(): Promise<MovieProps[]> {
    try {
        const movies = await fetchComingSoonMovies();
        return movies.map(formatMovieResponse);
    } catch (error) {
        console.error("Lỗi khi lấy phim sắp chiếu:", error);
        return [];
    }
}

export async function getPopularMovies(): Promise<MovieProps[]> {
    try {
        const movies = await fetchPopularMovies();
        return movies.map(formatMovieResponse);
    } catch (error) {
        console.error("Lỗi khi lấy phim phổ biến:", error);
        return [];
    }
}

export async function getMovieById(id: string): Promise<MovieProps | null> {
    try {
        const movie = await fetchMovieById(id);
        if (!movie) return null;
        return formatMovieResponse(movie);
    } catch (error) {
        console.error(`Lỗi khi lấy thông tin phim id=${id}:`, error);
        return null;
    }
}

// Helper function to get genres from the database
export async function getMovieGenres(): Promise<{ [key: number]: string }> {
    try {
        const genresResult = await fetch('/api/genres').then(res => res.json());
        if (!genresResult.success) {
            return {};
        }

        const genres: { [key: number]: string } = {};
        genresResult.data.forEach((genre: { id_genre: number, genre_name: string }) => {
            genres[genre.id_genre] = genre.genre_name;
        });

        return genres;
    } catch (error) {
        console.error("Lỗi khi lấy thể loại phim:", error);
        return {}; // Trả về đối tượng rỗng nếu gặp lỗi
    }
}

import { logger } from './logger';

// Function to get credits (cast and crew) for a movie
export async function getMovieCredits(id: number | string): Promise<any> {
    try {
        if (!id) {
            logger.error('Movie ID is required for getMovieCredits');
            return { director: null, actors: [] };
        }

        // Get movie details which now includes director and actors
        const movie = await getMovieById(id.toString());

        if (!movie) {
            logger.error(`Movie not found with ID ${id}`);
            return { director: null, actors: [] };
        }

        // Normalize response data
        return {
            director: movie.director || null,
            actors: movie.actors ? movie.actors.split(',').map(actor => actor.trim()) : []
        };
    } catch (error) {
        logger.error(`Failed to get credits for movie ${id}:`, error);
        return { director: null, actors: [] };
    }
}
