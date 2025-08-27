'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Movie } from '@/lib/movieDb';
import { uploadImage, validateImageFile } from '@/lib/uploadHelpers';

interface Genre {
    id: number;
    name: string;
}

interface MovieFormProps {
    movie?: Movie;
    genres: Genre[];
}

export default function MovieForm({ movie, genres }: MovieFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        title: movie?.title || '',
        original_title: movie?.original_title || '',
        director: movie?.director || '',
        cast: movie?.actors || '',
        description: movie?.description || '',
        duration: movie?.duration || '',
        release_date: movie?.release_date ? new Date(movie.release_date).toISOString().split('T')[0] : '',
        end_date: movie?.end_date ? new Date(movie.end_date).toISOString().split('T')[0] : '',
        language: movie?.language || '',
        subtitle: movie?.subtitle || '',
        country: movie?.country || '',
        poster_url: movie?.poster_image || '',
        banner_url: movie?.banner_image || '',
        trailer_url: movie?.trailer_url || '',
        age_restriction: movie?.age_restriction || 'P',
        status: movie?.status || 'coming soon',
        selectedGenres: movie?.genres || []
    });

    const [previewImage, setPreviewImage] = useState(formData.poster_url);
    const [previewBanner, setPreviewBanner] = useState(formData.banner_url);
    const [uploading, setUploading] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
    const [bannerUploadMethod, setBannerUploadMethod] = useState<'url' | 'file'>('url');

    // Xử lý khi nhập liệu
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Xử lý khi chọn thể loại phim
    const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const options = e.target.options;
        const selectedGenres = [];

        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selectedGenres.push(options[i].value);
            }
        }

        setFormData({
            ...formData,
            selectedGenres
        });
    };

    // Xử lý upload file ảnh
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file using helper
        const validation = validateImageFile(file);
        if (!validation.valid) {
            setError(validation.message || 'File không hợp lệ');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const result = await uploadImage(file, 'movies');

            if (result.success && result.url) {
                setFormData(prev => ({ ...prev, poster_url: result.url! }));
                setPreviewImage(result.url);
            } else {
                setError(result.message || 'Lỗi khi upload ảnh');
            }
        } catch (err: any) {
            console.error('Upload error:', err);
            setError('Lỗi khi upload ảnh: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    // Xử lý upload banner file
    const handleBannerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file using helper
        const validation = validateImageFile(file);
        if (!validation.valid) {
            setError(validation.message || 'File không hợp lệ');
            return;
        }

        setUploadingBanner(true);
        setError(null);

        try {
            const result = await uploadImage(file, 'movies');

            if (result.success && result.url) {
                setFormData(prev => ({ ...prev, banner_url: result.url! }));
                setPreviewBanner(result.url);
            } else {
                setError(result.message || 'Lỗi khi upload banner');
            }
        } catch (err: any) {
            console.error('Banner upload error:', err);
            setError('Lỗi khi upload banner: ' + err.message);
        } finally {
            setUploadingBanner(false);
        }
    };

    // Xử lý khi xem trước poster
    useEffect(() => {
        if (formData.poster_url) {
            setPreviewImage(formData.poster_url);
        }
    }, [formData.poster_url]);

    // Xử lý khi xem trước banner
    useEffect(() => {
        if (formData.banner_url) {
            setPreviewBanner(formData.banner_url);
        }
    }, [formData.banner_url]);

    // Xử lý khi submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const movieData = {
                title: formData.title,
                original_title: formData.original_title,
                director: formData.director,
                cast: formData.cast, // updateMovie expects 'cast' field
                description: formData.description,
                duration: parseInt(formData.duration as string) || 0,
                release_date: formData.release_date,
                end_date: formData.end_date,
                language: formData.language,
                subtitle: formData.subtitle,
                country: formData.country,
                poster_url: formData.poster_url, // updateMovie expects 'poster_url' field
                banner_url: formData.banner_url, // updateMovie expects 'banner_url' field
                trailer_url: formData.trailer_url,
                age_restriction: formData.age_restriction,
                status: formData.status,
                genres: formData.selectedGenres
            };

            console.log('📤 Sending movie data:', movieData);

            let response;

            if (movie) {
                // Cập nhật phim
                response = await axios.put(`/api/admin/movies/${movie.id_movie}`, movieData);
            } else {
                // Thêm phim mới
                response = await axios.post('/api/admin/movies', movieData);
            }

            if (response.data.success) {
                setSuccess(movie ? 'Cập nhật phim thành công!' : 'Thêm phim mới thành công!');

                // Chuyển về trang quản lý phim sau 2 giây
                setTimeout(() => {
                    router.push('/admin/movies');
                }, 2000);
            } else {
                setError(response.data.message || 'Đã xảy ra lỗi khi lưu phim');
            }
        } catch (err: any) {
            console.error('Lỗi khi lưu phim:', err);

            // Hiển thị thông tin lỗi chi tiết hơn để debug
            if (err.response?.data?.message) {
                setError(`Lỗi từ server: ${err.response.data.message}`);
            } else if (err.message) {
                setError(`Lỗi: ${err.message}`);
            } else {
                setError('Đã xảy ra lỗi không xác định khi lưu phim');
            }

            // Log chi tiết lỗi để debug
            if (err.response) {
                console.error('Response error:', {
                    data: err.response.data,
                    status: err.response.status,
                    headers: err.response.headers
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">
                    {movie ? 'Chỉnh sửa phim' : 'Thêm phim mới'}
                </h2>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 mb-4 sm:mb-6 text-sm sm:text-base">
                        <p>{error}</p>
                    </div>
                )}

                {success && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 sm:p-4 mb-4 sm:mb-6 text-sm sm:text-base">
                        <p>{success}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                        {/* Cột trái */}
                        <div className="space-y-4">
                            {/* Tiêu đề phim */}
                            <div>
                                <label htmlFor="title" className="block text-gray-700 font-bold mb-2">
                                    Tiêu đề phim <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Tiêu đề gốc */}
                            <div>
                                <label htmlFor="original_title" className="block text-gray-700 font-bold mb-2">
                                    Tiêu đề gốc
                                </label>
                                <input
                                    type="text"
                                    id="original_title"
                                    name="original_title"
                                    value={formData.original_title}
                                    onChange={handleInputChange}
                                    placeholder="Tên phim bằng tiếng gốc"
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Đạo diễn */}
                            <div>
                                <label htmlFor="director" className="block text-gray-700 font-bold mb-2">
                                    Đạo diễn
                                </label>
                                <input
                                    type="text"
                                    id="director"
                                    name="director"
                                    value={formData.director}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Diễn viên */}
                            <div>
                                <label htmlFor="cast" className="block text-gray-700 font-bold mb-2">
                                    Diễn viên
                                </label>
                                <input
                                    type="text"
                                    id="cast"
                                    name="cast"
                                    value={formData.cast}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Thời lượng */}
                            <div>
                                <label htmlFor="duration" className="block text-gray-700 font-bold mb-2">
                                    Thời lượng (phút)
                                </label>
                                <input
                                    type="number"
                                    id="duration"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleInputChange}
                                    min="0"
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Ngôn ngữ */}
                            <div>
                                <label htmlFor="language" className="block text-gray-700 font-bold mb-2">
                                    Ngôn ngữ
                                </label>
                                <select
                                    id="language"
                                    name="language"
                                    value={formData.language}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="">Chọn ngôn ngữ</option>
                                    <option value="Vietnamese">Tiếng Việt</option>
                                    <option value="English">Tiếng Anh</option>
                                    <option value="Korean">Tiếng Hàn</option>
                                    <option value="Japanese">Tiếng Nhật</option>
                                    <option value="Chinese">Tiếng Trung</option>
                                    <option value="Thai">Tiếng Thái</option>
                                    <option value="French">Tiếng Pháp</option>
                                    <option value="Spanish">Tiếng Tây Ban Nha</option>
                                    <option value="Other">Khác</option>
                                </select>
                            </div>

                            {/* Phụ đề */}
                            <div>
                                <label htmlFor="subtitle" className="block text-gray-700 font-bold mb-2">
                                    Phụ đề
                                </label>
                                <select
                                    id="subtitle"
                                    name="subtitle"
                                    value={formData.subtitle}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="">Không có phụ đề</option>
                                    <option value="Vietnamese">Phụ đề Tiếng Việt</option>
                                    <option value="English">Phụ đề Tiếng Anh</option>
                                    <option value="Korean">Phụ đề Tiếng Hàn</option>
                                    <option value="Japanese">Phụ đề Tiếng Nhật</option>
                                    <option value="Chinese">Phụ đề Tiếng Trung</option>
                                </select>
                            </div>

                            {/* Quốc gia */}
                            <div>
                                <label htmlFor="country" className="block text-gray-700 font-bold mb-2">
                                    Quốc gia sản xuất
                                </label>
                                <input
                                    type="text"
                                    id="country"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    placeholder="Nhập quốc gia"
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Ngày khởi chiếu */}
                            <div>
                                <label htmlFor="release_date" className="block text-gray-700 font-bold mb-2">
                                    Ngày khởi chiếu <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    id="release_date"
                                    name="release_date"
                                    value={formData.release_date}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Ngày kết thúc chiếu */}
                            <div>
                                <label htmlFor="end_date" className="block text-gray-700 font-bold mb-2">
                                    Ngày kết thúc chiếu
                                </label>
                                <input
                                    type="date"
                                    id="end_date"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Giới hạn độ tuổi */}
                            <div>
                                <label htmlFor="age_restriction" className="block text-gray-700 font-bold mb-2">
                                    Giới hạn độ tuổi
                                </label>
                                <select
                                    id="age_restriction"
                                    name="age_restriction"
                                    value={formData.age_restriction}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="P">P - Phổ biến</option>
                                    <option value="K">K - Khuyến cáo</option>
                                    <option value="T13">T13 - 13+</option>
                                    <option value="T16">T16 - 16+</option>
                                    <option value="T18">T18 - 18+</option>
                                    <option value="C">C - Cấm</option>
                                </select>
                            </div>

                            {/* Trạng thái */}
                            <div>
                                <label htmlFor="status" className="block text-gray-700 font-bold mb-2">
                                    Trạng thái <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="coming soon">Sắp chiếu</option>
                                    <option value="now showing">Đang chiếu</option>
                                    <option value="expired">Đã kết thúc</option>
                                </select>
                            </div>
                        </div>

                        {/* Cột phải */}
                        <div className="space-y-4">
                            {/* Mô tả */}
                            <div>
                                <label htmlFor="description" className="block text-gray-700 font-bold mb-2">
                                    Mô tả
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={6}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                                ></textarea>
                            </div>

                            {/* Poster Image */}
                            <div>
                                <label className="block text-gray-700 font-bold mb-2">
                                    Poster phim
                                </label>

                                {/* Toggle between URL and File upload */}
                                <div className="flex gap-4 mb-3">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="uploadMethod"
                                            value="url"
                                            checked={uploadMethod === 'url'}
                                            onChange={(e) => setUploadMethod(e.target.value as 'url' | 'file')}
                                            className="mr-2"
                                        />
                                        Nhập URL
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="uploadMethod"
                                            value="file"
                                            checked={uploadMethod === 'file'}
                                            onChange={(e) => setUploadMethod(e.target.value as 'url' | 'file')}
                                            className="mr-2"
                                        />
                                        Upload từ máy
                                    </label>
                                </div>

                                {uploadMethod === 'url' ? (
                                    <input
                                        type="text"
                                        id="poster_url"
                                        name="poster_url"
                                        value={formData.poster_url}
                                        onChange={handleInputChange}
                                        placeholder="https://example.com/poster.jpg"
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                                    />
                                ) : (
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                                disabled={uploading}
                                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            />
                                            {uploading && (
                                                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                                                    <div className="flex items-center text-blue-600">
                                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Đang upload...
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            Chọn file ảnh (JPG, PNG, GIF). Tối đa 5MB.
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Xem trước poster */}
                            {previewImage && (
                                <div className="mt-4">
                                    <p className="text-gray-700 font-bold mb-2">Xem trước poster:</p>
                                    <div className="border border-gray-300 w-40 h-60 overflow-hidden rounded">
                                        <img
                                            src={previewImage}
                                            alt="Movie Poster Preview"
                                            className="w-full h-full object-cover"
                                            onError={() => setPreviewImage('/images/movie-placeholder.jpg')}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Banner Image */}
                            <div>
                                <label className="block text-gray-700 font-bold mb-2">
                                    Ảnh Banner (Ngang - 16:9) *
                                </label>

                                {/* Banner Upload Method Toggle */}
                                <div className="flex gap-4 mb-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="bannerUploadMethod"
                                            value="url"
                                            checked={bannerUploadMethod === 'url'}
                                            onChange={(e) => setBannerUploadMethod(e.target.value as 'url' | 'file')}
                                            className="mr-2"
                                        />
                                        URL
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="bannerUploadMethod"
                                            value="file"
                                            checked={bannerUploadMethod === 'file'}
                                            onChange={(e) => setBannerUploadMethod(e.target.value as 'url' | 'file')}
                                            className="mr-2"
                                        />
                                        Upload File
                                    </label>
                                </div>

                                {bannerUploadMethod === 'url' ? (
                                    <input
                                        type="text"
                                        name="banner_url"
                                        value={formData.banner_url}
                                        onChange={handleInputChange}
                                        placeholder="https://example.com/banner.jpg"
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                                    />
                                ) : (
                                    <div className="space-y-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleBannerFileUpload}
                                            disabled={uploadingBanner}
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                                        />
                                        {uploadingBanner && (
                                            <div className="text-blue-600 text-sm">
                                                Đang upload banner...
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Xem trước banner */}
                            {previewBanner && (
                                <div className="mt-4">
                                    <p className="text-gray-700 font-bold mb-2">Xem trước banner:</p>
                                    <div className="border border-gray-300 w-full max-w-md h-36 overflow-hidden rounded">
                                        <img
                                            src={previewBanner}
                                            alt="Movie Banner Preview"
                                            className="w-full h-full object-cover"
                                            onError={() => setPreviewBanner('/images/movie-placeholder.jpg')}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* URL Trailer */}
                            <div>
                                <label htmlFor="trailer_url" className="block text-gray-700 font-bold mb-2">
                                    URL Trailer (YouTube)
                                </label>
                                <input
                                    type="text"
                                    id="trailer_url"
                                    name="trailer_url"
                                    value={formData.trailer_url}
                                    onChange={handleInputChange}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Thể loại phim */}
                            <div>
                                <label htmlFor="selectedGenres" className="block text-gray-700 font-bold mb-2">
                                    Thể loại phim (giữ Ctrl để chọn nhiều)
                                </label>
                                <select
                                    id="selectedGenres"
                                    name="selectedGenres"
                                    multiple
                                    value={formData.selectedGenres}
                                    onChange={handleGenreChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2 h-40 focus:outline-none focus:border-blue-500"
                                >
                                    {genres.map((genre) => (
                                        <option key={genre.id} value={genre.name}>
                                            {genre.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Nút */}
                    <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                        <button
                            type="button"
                            onClick={() => router.push('/admin/movies')}
                            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm sm:text-base"
                        >
                            Hủy
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm sm:text-base ${loading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {loading ? 'Đang lưu...' : movie ? 'Cập nhật phim' : 'Thêm phim mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
