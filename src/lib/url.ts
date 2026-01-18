import { ENV } from "@/config/env";

/**
 * properUrl - Sanitize and format Strapi Media URLs
 * Ensures that specific localhost dev URLs (often stored in DB) are replaced
 * with the configured production URL.
 * 
 * @param url The raw URL from Strapi
 * @returns Fully qualified, corrected URL
 */
export const getStrapiMedia = (url: string | null | undefined): string | null => {
    if (!url) return null;

    // Check for "localhost" leakage in absolute URLs
    if (url.includes('localhost:') || url.includes('127.0.0.1')) {
        // Replace known localhost variations with production URL
        return url
            .replace('http://localhost:1337', ENV.STRAPI_URL)
            .replace('http://127.0.0.1:1337', ENV.STRAPI_URL);
    }

    // Return absolute URLs as is (if not localhost)
    if (url.startsWith('http') || url.startsWith('//')) {
        return url;
    }

    // Prepend Strapi URL to relative paths
    return `${ENV.STRAPI_URL}${url}`;
};
