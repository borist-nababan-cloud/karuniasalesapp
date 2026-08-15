import { getDistance } from 'geolib';
import type { AttendanceParams } from './types';
export const calculateBranchDistance = (params: AttendanceParams): number => {
    return getDistance(
        { latitude: params.userLat, longitude: params.userLng },
        { latitude: params.branchLat, longitude: params.branchLng }
    );
};

export const isWithinRadius = (distance: number, radiusMeters: number = 500): boolean => {
    return distance <= radiusMeters;
};