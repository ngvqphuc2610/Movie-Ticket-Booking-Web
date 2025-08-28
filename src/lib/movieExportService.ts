import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, HeadingLevel, AlignmentType } from 'docx';

export interface ExportMovie {
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
    age_restriction?: string;
    status: string;
    genres?: string;
}

// Export to Excel
export const exportToExcel = (movies: ExportMovie[], filename = 'movies_export') => {
    // Chuẩn bị dữ liệu cho Excel
    const excelData = movies.map((movie, index) => ({
        'STT': index + 1,
        'ID': movie.id_movie,
        'Tên phim': movie.title,
        'Tên gốc': movie.original_title || '',
        'Đạo diễn': movie.director || '',
        'Diễn viên': movie.actors || '',
        'Thời lượng (phút)': movie.duration,
        'Ngày phát hành': new Date(movie.release_date).toLocaleDateString('vi-VN'),
        'Ngày kết thúc': movie.end_date ? new Date(movie.end_date).toLocaleDateString('vi-VN') : '',
        'Ngôn ngữ': movie.language || '',
        'Phụ đề': movie.subtitle || '',
        'Quốc gia': movie.country || '',
        'Phân loại độ tuổi': movie.age_restriction || '',
        'Trạng thái': getStatusText(movie.status),
        'Thể loại': movie.genres || '',
        'Mô tả': movie.description || ''
    }));

    // Tạo workbook và worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();

    // Thiết lập độ rộng cột
    const colWidths = [
        { wch: 5 },   // STT
        { wch: 8 },   // ID
        { wch: 30 },  // Tên phim
        { wch: 30 },  // Tên gốc
        { wch: 20 },  // Đạo diễn
        { wch: 40 },  // Diễn viên
        { wch: 12 },  // Thời lượng
        { wch: 15 },  // Ngày phát hành
        { wch: 15 },  // Ngày kết thúc
        { wch: 12 },  // Ngôn ngữ
        { wch: 12 },  // Phụ đề
        { wch: 15 },  // Quốc gia
        { wch: 15 },  // Phân loại độ tuổi
        { wch: 15 },  // Trạng thái
        { wch: 20 },  // Thể loại
        { wch: 50 }   // Mô tả
    ];
    ws['!cols'] = colWidths;

    // Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách phim');

    // Tạo file và download
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Export to DOCX
export const exportToDocx = async (movies: ExportMovie[], filename = 'movies_export') => {
    // Tạo header cho bảng
    const tableHeaders = new TableRow({
        children: [
            new TableCell({ children: [new Paragraph({ text: "STT", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "Tên phim", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "Đạo diễn", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "Thời lượng", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "Ngày phát hành", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "Trạng thái", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "Mô tả", alignment: AlignmentType.CENTER })] }),
        ],
    });

    // Tạo các hàng dữ liệu
    const tableRows = movies.map((movie, index) =>
        new TableRow({
            children: [
                new TableCell({ children: [new Paragraph({ text: (index + 1).toString(), alignment: AlignmentType.CENTER })] }),
                new TableCell({ children: [new Paragraph({ text: movie.title })] }),
                new TableCell({ children: [new Paragraph({ text: movie.director || '' })] }),
                new TableCell({ children: [new Paragraph({ text: `${movie.duration} phút`, alignment: AlignmentType.CENTER })] }),
                new TableCell({ children: [new Paragraph({ text: new Date(movie.release_date).toLocaleDateString('vi-VN'), alignment: AlignmentType.CENTER })] }),
                new TableCell({ children: [new Paragraph({ text: getStatusText(movie.status), alignment: AlignmentType.CENTER })] }),
                new TableCell({ children: [new Paragraph({ text: (movie.description || '').substring(0, 100) + (movie.description && movie.description.length > 100 ? '...' : '') })] }),
            ],
        })
    );

    // Tạo bảng
    const table = new Table({
        rows: [tableHeaders, ...tableRows],
        width: {
            size: 100,
            type: 'pct',
        },
    });

    // Tạo document
    const doc = new Document({
        sections: [
            {
                children: [
                    new Paragraph({
                        text: "DANH SÁCH PHIM CINEMA",
                        heading: HeadingLevel.TITLE,
                        alignment: AlignmentType.CENTER,
                    }),
                    new Paragraph({
                        text: `Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`,
                        alignment: AlignmentType.RIGHT,
                    }),
                    new Paragraph({
                        text: `Tổng số phim: ${movies.length}`,
                        alignment: AlignmentType.LEFT,
                    }),
                    new Paragraph({ text: "" }), // Dòng trống
                    table,
                    new Paragraph({ text: "" }), // Dòng trống
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "Ghi chú:",
                                bold: true,
                            }),
                        ],
                    }),
                    new Paragraph({
                        text: "- Đang chiếu: Phim hiện đang được chiếu tại rạp",
                    }),
                    new Paragraph({
                        text: "- Sắp chiếu: Phim sẽ được chiếu trong thời gian tới",
                    }),
                    new Paragraph({
                        text: "- Đã kết thúc: Phim đã ngừng chiếu",
                    }),
                ],
            },
        ],
    });

    // Tạo file và download
    const buffer = await Packer.toBuffer(doc);
    const arrayBuffer = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    const blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.docx`);
};

// Helper function để chuyển đổi trạng thái
const getStatusText = (status: string): string => {
    switch (status) {
        case 'now showing':
            return 'Đang chiếu';
        case 'coming soon':
            return 'Sắp chiếu';
        case 'expired':
            return 'Đã kết thúc';
        default:
            return status;
    }
};

// Export with filters
export const exportMoviesWithFilters = async (
    exportType: 'excel' | 'docx',
    filters: {
        status?: string;
        search?: string;
        includeGenres?: boolean;
    } = {}
) => {
    try {
        // Gọi API để lấy dữ liệu phim với filters
        const params = new URLSearchParams({
            limit: '1000', // Lấy tất cả
            export: 'true',
            ...(filters.status !== 'all' && { status: filters.status }),
            ...(filters.search && { search: filters.search }),
            ...(filters.includeGenres && { include_genres: 'true' })
        });

        const response = await fetch(`/api/admin/movies?${params}`);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Không thể xuất dữ liệu');
        }

        const movies = data.data.movies || [];

        if (movies.length === 0) {
            throw new Error('Không có dữ liệu phim để xuất');
        }

        // Tạo tên file dựa trên filters
        let filename = 'movies_export';
        if (filters.status && filters.status !== 'all') {
            filename += `_${filters.status.replace(' ', '_')}`;
        }
        if (filters.search) {
            filename += `_search_${filters.search.replace(/[^a-zA-Z0-9]/g, '_')}`;
        }

        // Export theo type
        if (exportType === 'excel') {
            exportToExcel(movies, filename);
        } else {
            await exportToDocx(movies, filename);
        }

        return {
            success: true,
            message: `Đã xuất ${movies.length} phim thành công`,
            count: movies.length
        };
    } catch (error: any) {
        console.error('Export error:', error);
        throw new Error(error.message || 'Có lỗi xảy ra khi xuất dữ liệu');
    }
};
