
// Standardize date formats across the application
export const dateFormats = {
    UI: 'DD/MM/YYYY',       // Format for displaying in UI
    DATABASE: 'YYYY-MM-DD', // Format for database queries
    API: 'YYYY-MM-DD',      // Format for API responses
};

/**
 * Converts a date string from one format to another
 * @param dateString The date string to convert
 * @param fromFormat The current format of the date string
 * @param toFormat The target format
 * @returns The converted date string
 */
export function convertDateFormat(
    dateString: string,
    fromFormat: 'DD/MM/YYYY' | 'YYYY-MM-DD',
    toFormat: 'DD/MM/YYYY' | 'YYYY-MM-DD'
): string {
    if (!dateString) return '';

    try {
        if (fromFormat === 'DD/MM/YYYY' && toFormat === 'YYYY-MM-DD') {
            const [day, month, year] = dateString.split('/');
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }

        if (fromFormat === 'YYYY-MM-DD' && toFormat === 'DD/MM/YYYY') {
            const [year, month, day] = dateString.split('-');
            return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
        }

        // Same format, return as is
        return dateString;
    } catch (error) {
        console.error('Error converting date format:', error);
        return dateString; // Return original if there's an error
    }
}

/**
 * Validates if a date string is in the specified format
 * @param dateString The date string to validate
 * @param format The expected format of the date string
 * @returns True if the date string matches the format
 */
export function isValidDateFormat(dateString: string, format: 'DD/MM/YYYY' | 'YYYY-MM-DD'): boolean {
    if (!dateString) return false;

    try {
        if (format === 'DD/MM/YYYY') {
            return /^\d{2}\/\d{2}\/\d{4}$/.test(dateString);
        }

        if (format === 'YYYY-MM-DD') {
            return /^\d{4}-\d{2}-\d{2}$/.test(dateString);
        }

        return false;
    } catch (error) {
        return false;
    }
}

/**
 * Gets today's date in the specified format
 * @param format The target format
 * @returns Today's date in the specified format
 */
export function getTodayInFormat(format: 'DD/MM/YYYY' | 'YYYY-MM-DD'): string {
    const today = new Date();

    if (format === 'DD/MM/YYYY') {
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        return `${day}/${month}/${year}`;
    }

    if (format === 'YYYY-MM-DD') {
         const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        return `${year}-${month}-${day}`;
    }

    return '';
}

/**
 * Checks if two dates are the same (ignoring time)
 * @param date1 First date string
 * @param format1 Format of the first date string
 * @param date2 Second date string
 * @param format2 Format of the second date string
 * @returns True if the dates are the same
 */
export function isSameDate(
    date1: string,
    format1: 'DD/MM/YYYY' | 'YYYY-MM-DD',
    date2: string,
    format2: 'DD/MM/YYYY' | 'YYYY-MM-DD'
): boolean {
    if (!date1 || !date2) return false;

    try {
        const standardDate1 = format1 === 'YYYY-MM-DD' ? date1 : convertDateFormat(date1, format1, 'YYYY-MM-DD');
        const standardDate2 = format2 === 'YYYY-MM-DD' ? date2 : convertDateFormat(date2, format2, 'YYYY-MM-DD');

        return standardDate1 === standardDate2;
    } catch (error) {
        return false;
    }
}
