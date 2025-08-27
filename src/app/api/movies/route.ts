import { NextRequest, NextResponse } from 'next/server';
import { getAllMovies } from '@/lib/movieDb';
import { createSuccessResponse, handleApiError } from '@/lib/apiUtils';
/**
 * GET /api/movies - Lấy tất cả phim
 * Query params:
 * - status: 'now showing' | 'coming soon' | 'expired' (optional)
 * - limit: number (optional)
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const limit = searchParams.get('limit');

        // Lấy tất cả phim
        const allMovies = await getAllMovies();

        // Filter theo status nếu có
        let filteredMovies = allMovies;
        if (status) {
            filteredMovies = allMovies.filter(movie => movie.status === status);
        }

        // Limit số lượng nếu có
        if (limit) {
            const limitNum = parseInt(limit, 10);
            if (!isNaN(limitNum) && limitNum > 0) {
                filteredMovies = filteredMovies.slice(0, limitNum);
            }
        }

        return NextResponse.json({
            success: true,
            data: filteredMovies,
            total: filteredMovies.length
        });

    } catch (error: any) {
        console.error('Error fetching movies:', error);
        return handleApiError(error, 'Failed to fetch movies');
    }
}

