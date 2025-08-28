"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Movie, MovieFilters, MoviePagination } from '@/types/movie';
import { exportMoviesWithFilters } from '@/lib/movieExportService';

export default function AdminMoviesPage() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [pagination, setPagination] = useState<MoviePagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
    const [loading, setLoading] = useState(true);
    const [syncingMovies, setSyncingMovies] = useState(false);
    const [syncStatus, setSyncStatus] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [exportStatus, setExportStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<MovieFilters>({
        status: 'all',
        search: ''
    });
    const router = useRouter();

    // Fetch movies from the database
    const fetchMovies = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                ...(filters.status !== 'all' && { status: filters.status }),
                ...(filters.search && { search: filters.search })
            });

            const response = await axios.get(`/api/admin/movies?${params}`, {
                timeout: 30000, // set timeout
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });

            if (response.data.success) {
                setMovies(response.data.data.movies || []);
                setPagination(response.data.data.pagination);
            } else {
                setError(response.data.message || 'Không thể tải danh sách phim');
            }
        } catch (err: any) {
            console.error('Lỗi khi tải danh sách phim:', err);

            // Provide more detailed error messages based on the error type
            if (err.code === 'ECONNABORTED') {
                setError('Quá thời gian kết nối. Máy chủ không phản hồi.');
            } else if (!err.response) {
                setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra server đã được khởi động chưa.');
            } else {
                setError(err.response?.data?.message || 'Đã xảy ra lỗi khi tải danh sách phim');
            }
        } finally {
            setLoading(false);
        }
    };

    // lấy movie từ api themoviedb
    const handleSyncMovies = async () => {
        setSyncingMovies(true);
        setSyncStatus('Đang đồng bộ phim từ TMDB...');

        try {
            const response = await axios.post('/api/admin/movies/sync', {}, {
                timeout: 30000, // set timeout
            });

            if (response.data.success) {
                setSyncStatus('Đồng bộ hoàn tất!');
                await fetchMovies(); // Refresh movie list
            } else {
                setSyncStatus(`Lỗi: ${response.data.message || 'Không thể đồng bộ phim'}`);
            }
        } catch (err: any) {
            console.error('Lỗi khi đồng bộ phim:', err);

            if (err.code === 'ECONNABORTED') {
                setSyncStatus('Quá thời gian kết nối. Máy chủ có thể vẫn đang đồng bộ phim.');
            } else if (!err.response) {
                setSyncStatus('Không thể kết nối đến máy chủ. Vui lòng kiểm tra server đã được khởi động chưa.');
            } else {
                setSyncStatus(`Lỗi: ${err.response?.data?.message || 'Đã xảy ra lỗi khi đồng bộ phim'}`);
            }
        } finally {
            // Keep the sync status visible longer to let user read it
            setTimeout(() => {
                setSyncStatus(null);
                setSyncingMovies(false);
            }, 5000);
        }
    };

    // Delete a movie
    const handleDeleteMovie = async (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa phim này?')) {
            try {
                setLoading(true);
                const response = await axios.delete(`/api/admin/movies/${id}`);

                if (response.data.success) {
                    setMovies(movies.filter(movie => movie.id_movie !== id));
                    alert('Xóa phim thành công!');
                } else {
                    alert(`Lỗi: ${response.data.message}`);
                }
            } catch (err: any) {
                console.error('Lỗi khi xóa phim:', err);

                if (err.response?.data?.message) {
                    alert(`Lỗi: ${err.response.data.message}`);
                } else {
                    alert('Đã xảy ra lỗi khi xóa phim');
                }
            } finally {
                setLoading(false);
            }
        }
    };

    // Export functions
    const handleExport = async (type: 'excel' | 'docx') => {
        setIsExporting(true);
        setExportStatus(`Đang xuất dữ liệu ra ${type.toUpperCase()}...`);

        try {
            const result = await exportMoviesWithFilters(type, {
                status: filters.status,
                search: filters.search,
                includeGenres: true
            });

            setExportStatus(result.message);

            // Clear status after 3 seconds
            setTimeout(() => {
                setExportStatus(null);
            }, 3000);
        } catch (error: any) {
            setExportStatus(`Lỗi: ${error.message}`);
            setTimeout(() => {
                setExportStatus(null);
            }, 5000);
        } finally {
            setIsExporting(false);
        }
    };

    const handleExportExcel = () => handleExport('excel');
    const handleExportDocx = () => handleExport('docx');

    // Handle filter changes
    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    };

    // Handle pagination
    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    // Load movies when the component mounts or filters change
    useEffect(() => {
        fetchMovies();
    }, [pagination.page, filters]);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-dark">Quản lý phim</h1>
                <div className="flex gap-4">
                    {/* Export Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleExportExcel}
                            disabled={isExporting}
                            className={`px-4 py-2 rounded text-white ${isExporting
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700'
                                }`}
                            title="Xuất ra file Excel"
                        >
                            📊 Excel
                        </button>
                        <button
                            onClick={handleExportDocx}
                            disabled={isExporting}
                            className={`px-4 py-2 rounded text-white ${isExporting
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            title="Xuất ra file Word"
                        >
                            📄 Word
                        </button>
                    </div>

                    <button
                        onClick={handleSyncMovies}
                        disabled={syncingMovies}
                        className={`px-4 py-2 rounded ${syncingMovies
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-700 text-white'
                            }`}
                    >
                        {syncingMovies ? 'Đang đồng bộ...' : 'Đồng bộ từ TMDB'}
                    </button>
                    <Link href="/admin/movies/add">
                        <button className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded">
                            Thêm phim mới
                        </button>
                    </Link>
                </div>
            </div>

            {/* Export Status */}
            {exportStatus && (
                <div className={`border-l-4 p-4 mb-6 ${exportStatus.includes('Lỗi')
                        ? 'bg-red-100 border-red-500 text-red-700'
                        : exportStatus.includes('thành công')
                            ? 'bg-green-100 border-green-500 text-green-700'
                            : 'bg-blue-100 border-blue-500 text-blue-700'
                    }`}>
                    <p>{exportStatus}</p>
                </div>
            )}

            {syncStatus && (
                <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6">
                    <p>{syncStatus}</p>
                </div>
            )}

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                    <p>{error}</p>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className='text-dark'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">Tất cả</option>
                            <option value="now showing">Đang chiếu</option>
                            <option value="coming soon">Sắp chiếu</option>
                            <option value="expired">Đã kết thúc</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            placeholder="Tìm theo tên phim, mô tả..."
                            className="w-full px-3 py-2 border text-dark border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={fetchMovies}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                        >
                            Làm mới
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10">
                    <p className="text-xl">Đang tải danh sách phim...</p>
                </div>
            ) : movies.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead>
                            <tr>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">ID</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">Poster</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">Tên phim</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">Ngôn ngữ/Quốc gia</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">Thời lượng</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">Ngày chiếu</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">Trạng thái</th>
                                <th className="py-3 px-4 bg-gray-100 border-b text-left text-dark">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movies.map((movie) => (
                                <tr key={movie.id_movie}>
                                    <td className="py-3 px-4 border-b text-dark">{movie.id_movie}</td>
                                    <td className="py-3 px-4 border-b">
                                        <img
                                            src={movie.poster_image}
                                            alt={movie.title}
                                            className="w-16 h-auto"
                                        />
                                    </td>
                                    <td className="py-3 px-4 border-b text-dark">
                                        <div>
                                            <div className="font-medium">{movie.title}</div>
                                            {movie.original_title && (
                                                <div className="text-sm text-gray-500 mt-1">
                                                    {movie.original_title}
                                                </div>
                                            )}
                                            {movie.description && (
                                                <div className="text-sm text-gray-500 mt-1">
                                                    {movie.description.length > 80
                                                        ? movie.description.substring(0, 80) + '...'
                                                        : movie.description
                                                    }
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 border-b text-dark">
                                        <div>
                                            <div className="text-sm">
                                                {movie.language || 'Chưa có thông tin'}
                                            </div>
                                            {movie.country && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {movie.country}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 border-b text-dark">
                                        {movie.duration ? `${movie.duration} phút` : 'Chưa có thông tin'}
                                    </td>
                                    <td className="py-3 px-4 border-b text-dark">
                                        {new Date(movie.release_date).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="py-3 px-4 border-b">
                                        <span
                                            className={`px-2 py-1 rounded text-sm ${movie.status === 'now showing'
                                                ? 'bg-green-100 text-green-800'
                                                : movie.status === 'coming soon'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {movie.status === 'now showing'
                                                ? 'Đang chiếu'
                                                : movie.status === 'coming soon'
                                                    ? 'Sắp chiếu'
                                                    : 'Đã kết thúc'
                                            }
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 border-b">
                                        <div className="flex gap-2">
                                            <Link href={`/admin/movies/edit/${movie.id_movie}`}>
                                                <button className="bg-yellow-500 hover:bg-yellow-700 text-white px-2 py-1 rounded text-sm">
                                                    Sửa
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteMovie(movie.id_movie)}
                                                className="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded text-sm"
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="bg-gray-50 text-dark px-6 py-3 flex items-center justify-between border-t">
                            <div className="text-sm text-gray-700">
                                {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)}
                                / {pagination.total} phim
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Trước
                                </button>

                                {/* Page numbers */}
                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    const pageNum = Math.max(1, pagination.page - 2) + i;
                                    if (pageNum > pagination.totalPages) return null;

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`px-3 py-1 text-sm border rounded ${pageNum === pagination.page
                                                ? 'bg-blue-500 text-white border-blue-500'
                                                : 'border-gray-300 hover:bg-gray-100'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.totalPages}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Sau
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-xl">Chưa có phim nào trong cơ sở dữ liệu</p>
                    <p className="mt-2 text-gray-500">
                        Sử dụng nút &quot;Đồng bộ từ TMDB&quot; để lấy dữ liệu phim từ The Movie Database
                    </p>
                </div>
            )}
        </div>
    );
}