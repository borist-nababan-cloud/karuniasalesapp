import { getDistance } from 'geolib';

export const isWithinRange = (
    currentLat: number,
    currentLng: number,
    targetLat: number,
    targetLng: number,
    radiusMeters: number = 500
): { isWithin: boolean; distance: number } => {

    const distance = getDistance(
        { latitude: currentLat, longitude: currentLng },
        { latitude: targetLat, longitude: targetLng }
    );

    return {
        isWithin: distance <= radiusMeters,
        distance
    };
};
