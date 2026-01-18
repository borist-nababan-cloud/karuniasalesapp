import { useEffect } from 'react';
import { useGeolocation } from './useGeolocation';
import { useAuthStore } from '@/stores/authStore';

const INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

export const useAttendanceTracker = () => {
    const { position } = useGeolocation();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    useEffect(() => {
        if (!isAuthenticated || !position) return;

        const sendLocation = async () => {
            try {
                // Mock: We assume we update the profile of the current user
                // await api.put('/sales-profiles/me/location', { 
                //     data: {
                //        location: {
                //           lat: position.latitude,
                //           lng: position.longitude,
                //           timestamp: new Date().toISOString()
                //        }
                //     }
                // });

            } catch (error) {
                console.error('Tracking failed', error);
            }
        };

        const intervalId = setInterval(sendLocation, INTERVAL_MS);

        return () => clearInterval(intervalId);
    }, [isAuthenticated, position]);
};
