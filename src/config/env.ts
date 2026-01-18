const getEnv = (key: string, required: boolean = false): string => {
    const value = import.meta.env[key];
    if (import.meta.env.PROD && value && value.includes('localhost')) {
        console.warn(`[SECURITY WARNING] Environment variable ${key} contains 'localhost' in production mode: ${value}. Usage may fail.`);
    }
    if (required && !value) {
        console.warn(`Missing environment variable: ${key}`); // Warn instead of throw to avoid crashing if partially configured in dev
    }
    return value || '';
};

const getSmartStrapiUrl = () => {
    let url = getEnv('VITE_STRAPI_URL');
    const baseUrl = getEnv('VITE_STRAPI_BASE_URL', true);

    // If STRAPI_URL is missing or is localhost (in production), try to derive it from BASE_URL
    const isLocalhost = url && (url.includes('localhost') || url.includes('127.0.0.1'));

    if ((!url || (import.meta.env.PROD && isLocalhost)) && baseUrl) {
        const derived = baseUrl.replace('/api', '');
        console.warn(`[CONFIG] VITE_STRAPI_URL was missing or localhost. Derived from BASE_URL: ${derived}`);
        return derived;
    }

    // SANITIZATION: Ensure STRAPI_URL does NOT end with /api
    if (url && url.endsWith('/api')) {
        return url.replace('/api', '');
    }

    return url;
};

export const ENV = {
    STRAPI_BASE_URL: getEnv('VITE_STRAPI_BASE_URL', true),
    STRAPI_URL: getSmartStrapiUrl(),
    QR_BASE_URL: getEnv('VITE_QR_BASE_URL', true),
    APP_VERSION: getEnv('VITE_APP_VERSION') || '1.0.0',
    GOOGLE_MAPS_API_KEY: getEnv('VITE_GOOGLE_MAPS_API_KEY'),
};
