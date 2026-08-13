const getEnv = (key: string, required: boolean = false): string => {
    const value = import.meta.env[key];
    
    return value || '';
};

export const ENV = {
    QR_BASE_URL: getEnv('VITE_QR_BASE_URL', true),
    APP_VERSION: getEnv('VITE_APP_VERSION') || '1.0.0',
    GOOGLE_MAPS_API_KEY: getEnv('VITE_GOOGLE_MAPS_API_KEY'),
};
