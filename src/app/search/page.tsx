'use client';

import { use } from 'react';
import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import MovieCard from '@/components/movies/MovieCard';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface Movie {
    id_movie: number;
    title: string;
    poster_image: string;
    status: string;
    release_date: string;
    duration: number;
    director: string;
    actors: string;
    country: string;
    age_restriction: string;
    description: string;
    genres: string;
}

interface SearchPageProps {
    searchParams: Promise<{ q?: string; status?: string; genre?: string }>;
}

export default function SearchPage({ searchParams }: SearchPageProps) {
    const params = use(searchParams);
    const router = useRouter();
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState(params.q || '');
    const [statusFilter, setStatusFilter] = useState(params.status || '');
    const [total, setTotal] = useState(0);
    const [hasMore, setHasMore] = useState(false);

    // Đồng bộ state với URL params
    useEffect(() => {
        setSearchQuery(params.q || '');
        setStatusFilter(params.status || '');
    }, [params.q, params.status]);

    useEffect(() => {
        if (params.q) {
            searchMovies(params.q, params.status, params.genre);
        }
    }, [params.q, params.status, params.genre]);

    const searchMovies = async (query: string, status?: string, genre?: string) => {
        if (!query.trim()) return;

        setLoading(true);
        try {
            const searchParams = new URLSearchParams({
                q: query,
                limit: '20',
                offset: '0'
            });

            // Thêm filter status nếu có và không phải 'all'
            if (status && status !== 'all') {
                searchParams.append('status', status);
            }
            if (genre) searchParams.append('genre', genre);

            console.log('Search params:', searchParams.toString()); // Debug log

            const response = await fetch(`/api/movies/search?${searchParams}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setMovies(data.data || []);
                    setTotal(data.pagination?.total || 0);
                    setHasMore(data.pagination?.hasMore || false);
                }
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            const newParams = new URLSearchParams();
            newParams.set('q', searchQuery.trim());
            if (statusFilter) newParams.set('status', statusFilter);

            router.push(`/search?${newParams.toString()}`);
        }
    };

    const handleStatusFilter = (status: string) => {
        // Cập nhật state ngay lập tức để UI phản hồi
        setStatusFilter(status);

        const newParams = new URLSearchParams();
        newParams.set('q', params.q || '');
        if (status && status !== 'all') {
            newParams.set('status', status);
        }

        router.push(`/search?${newParams.toString()}`);
    };

    return (
        <Layout>
            <div className="container mx-auto px-0 py-8">
                {/* Search Header */}
                <div className="mb-8 px-4">
                    <h1 className="text-4xl font-bold text-white mb-6 text-center">
                        Tìm kiếm phim
                    </h1>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="flex gap-4 mb-6 px-4">
                        <div className="flex-1 relative">
                            <Input
                                type="search"
                                placeholder="Nhập tên phim, đạo diễn, diễn viên..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-white text-black pl-5 pr-12 py-3 rounded-lg"
                            />
                            <button type="submit" className="absolute right-3 top-3">
                                <Search className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                    </form>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-4 items-center justify-center px-4 mb-8">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-white" />
                            <span className="text-white text-sm">Lọc theo:</span>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant={!params.status || params.status === 'all' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => handleStatusFilter('all')}
                                className="text-sm"
                            >
                                Tất cả
                            </Button>
                            <Button
                                variant={params.status === 'now showing' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => handleStatusFilter('now showing')}
                                className="text-sm"
                            >
                                Đang chiếu
                            </Button>
                            <Button
                                variant={params.status === 'coming soon' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => handleStatusFilter('coming soon')}
                                className="text-sm"
                            >
                                Sắp chiếu
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Search Results */}
                {params.q && (
                    <div className="mb-8 px-4">
                        <h2 className="text-2xl text-white mb-4 text-center">
                            Kết quả tìm kiếm cho: <span className="text-[#EBDB40]">"{params.q}"</span>
                        </h2>
                        <p className="text-gray-300 text-sm text-center">
                            Tìm thấy {total} kết quả
                        </p>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
                    </div>
                )}

                {/* Results - sử dụng layout giống trang movie */}
                {!loading && movies.length > 0 && (
                    <div className="px-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4  gap-6">
                            {movies.map((movie) => (
                                <div key={movie.id_movie} className="hover:text-[#EBDB40] transition-transform">
                                    <MovieCard
                                        id={movie.id_movie.toString()}
                                        title={movie.title}
                                        poster={movie.poster_image}
                                        trailerUrl=""
                                        status={movie.status as "coming soon" | "now showing" | "expired"}
                                        releaseDate={movie.release_date}
                                        duration={movie.duration}
                                        director={movie.director}
                                        actors={movie.actors || ''}
                                        country={movie.country}
                                        ageRestriction={movie.age_restriction}
                                        description={movie.description}
                                        genres={movie.genres ? movie.genres.split(',').map(genre => genre.trim()) : []}
                                        genre={movie.genres ? movie.genres.split(',')[0]?.trim() : ''}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* No Results */}
                {!loading && params.q && movies.length === 0 && (
                    <div className="text-center py-12 px-4">
                        <div className="text-gray-400 mb-4">
                            <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <h3 className="text-xl font-medium mb-2">Không tìm thấy kết quả</h3>
                            <p className="text-sm">
                                Không có phim nào phù hợp với từ khóa "{params.q}"
                            </p>
                        </div>
                        <div className="text-sm text-gray-500">
                            <p className="mb-2">Gợi ý:</p>
                            <ul className="space-y-1">
                                <li>• Kiểm tra lại chính tả</li>
                                <li>• Thử sử dụng từ khóa khác</li>
                                <li>• Tìm kiếm theo tên đạo diễn hoặc diễn viên</li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !params.q && (
                    <div className="text-center py-12 px-4">
                        <Search className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
                        <h3 className="text-xl font-medium text-white mb-2">
                            Tìm kiếm phim yêu thích
                        </h3>
                        <p className="text-gray-400">
                            Nhập tên phim, đạo diễn hoặc diễn viên để bắt đầu tìm kiếm
                        </p>
                    </div>
                )}
            </div>
        </Layout>
    );
}