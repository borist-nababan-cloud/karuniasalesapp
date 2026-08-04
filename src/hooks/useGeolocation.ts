import { useState, useEffect } from 'react';

interface Position {
    latitude: number;
    longitude: number;
}

interface GeolocationState {
    position: Position | null;
    error: string | null;
    loading: boolean;
}

export const useGeolocation = (enableHighAccuracy = true) => {
    const [state, setState] = useState<GeolocationState>({
        position: null,
        error: null,
        loading: true,
    });

    useEffect(() => {
        if (!navigator.geolocation) {
            setState((prev) => ({ ...prev, error: 'Geolocation is not supported', loading: false }));
            return;
        }

        const success = (position: GeolocationPosition) => {
            setState({
                position: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                },
                error: null,
                loading: false,
            });
        };

        const error = (error: GeolocationPositionError) => {
            setState((prev) => ({ ...prev, error: error.message, loading: false }));
        };

        const options = {
            enableHighAccuracy,
            timeout: 30000,
            maximumAge: 10000,
        };

        // Watch position (this automatically fetches the initial position too)
        const watchId = navigator.geolocation.watchPosition(success, error, options);

        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, [enableHighAccuracy]);

    return state;
};
