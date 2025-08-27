// Movie types
export interface Movie {
  id_movie: number;
  title: string;
  original_title?: string;
  director?: string;
  actors?: string;
  duration: number;
  release_date: string;
  end_date?: string;
  language?: string;
  subtitle?: string;
  country?: string;
  description?: string;
  poster_image?: string;
  trailer_url?: string;
  age_restriction?: string;
  status: 'now showing' | 'coming soon' | 'expired';
}

export interface MovieFilters {
  status: string;
  search: string;
}

export interface MoviePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface MovieApiResponse {
  success: boolean;
  message?: string;
  data?: {
    movies: Movie[];
    pagination: MoviePagination;
  };
  error?: string;
}
