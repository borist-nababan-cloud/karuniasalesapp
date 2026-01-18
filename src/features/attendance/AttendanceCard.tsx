import { useState, useEffect, useCallback, useRef } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { isWithinRange } from './attendanceUtils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch'; // Import Switch
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { api } from '@/lib/axios';

// Mock Branch Location (Jakarta)
const BRANCH_LOCATION = {
    latitude: -6.175392,
    longitude: 106.827153,
    radius: 500 // meters
};

interface AttendanceCardProps {
    profileId: number | string; // documentId (string) or id (number)
    initialStatus: string | boolean;
    isBlocked: boolean;
}

export default function AttendanceCard({ profileId, initialStatus, isBlocked }: AttendanceCardProps) {
    const { position, error: geoError, loading: geoLoading } = useGeolocation();

    // Normalize initial status to check if 'ONLINE' or true
    const [isCheckedIn, setIsCheckedIn] = useState(false);

    // Sync state with prop on mount and change
    useEffect(() => {
        const isActive = initialStatus === 'ONLINE' || initialStatus === true || initialStatus === 'true';
        setIsCheckedIn(isActive);
    }, [initialStatus]);

    // ... (rest of code)

    // ...

    const [distance, setDistance] = useState<number | null>(null);
    const [canCheckIn, setCanCheckIn] = useState(false);
    const [loading, setLoading] = useState(false);
    const [syncLoading, setSyncLoading] = useState(false);

    // Ref to hold latest position without triggering effect re-runs for interval
    const positionRef = useRef(position);

    useEffect(() => {
        positionRef.current = position;
    }, [position]);

    // Check Geofence (Visual feedback only)
    useEffect(() => {
        if (position) {
            const check = isWithinRange(
                position.latitude,
                position.longitude,
                BRANCH_LOCATION.latitude,
                BRANCH_LOCATION.longitude,
                BRANCH_LOCATION.radius
            );
            setDistance(check.distance);
            setCanCheckIn(check.isWithin);
        }
    }, [position]);

    // Update Location Helper
    const updateLocation = useCallback(async (currentPos: { latitude: number; longitude: number }) => {
        if (!currentPos) return;
        try {

            await api.put(`/sales-profiles/${profileId}`, {
                data: {
                    location: currentPos // JSON field
                }
            });

        } catch (error) {
            console.error("Failed to sync location", error);
        }
    }, [profileId]);

    // Interval: Sync location every 30 minutes if Online
    // Now depends ONLY on isCheckedIn, not position.
    useEffect(() => {
        let intervalId: ReturnType<typeof setInterval>;

        if (isCheckedIn) {
            intervalId = setInterval(() => {
                if (positionRef.current) {
                    updateLocation(positionRef.current);
                }
            }, 30 * 60 * 1000); // 30 minutes
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isCheckedIn, updateLocation]);


    // Toggle Online/Offline
    const handleToggleStatus = async (checked: boolean) => {
        setLoading(true);

        try {
            await api.put(`/sales-profiles/${profileId}`, {
                data: {
                    online_stat: checked
                }
            });

            setIsCheckedIn(checked);

            // If turning ON, sync location immediately using latest ref or current position
            if (checked && positionRef.current) {
                await updateLocation(positionRef.current);
            }
        } catch (error) {
            console.error('Status update failed', error);
            // Revert switch if failed
            // setIsCheckedIn(!checked);
            alert('Failed to update status.');
        } finally {
            setLoading(false);
        }
    };

    // Manual "Set Position" Handler
    const handleManualSync = async () => {
        if (!position) {
            alert("Waiting for GPS location...");
            return;
        }
        setSyncLoading(true);
        try {
            await updateLocation(position);
            alert("Position updated successfully!");
        } catch (error) {
            alert("Failed to update position.");
        } finally {
            setSyncLoading(false);
        }
    };

    return (
        <Card className="bg-blue-50 border-blue-100">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-blue-900">Attendance</CardTitle>
                        <CardDescription className="text-blue-700">
                            {geoLoading ? 'Locating...' :
                                geoError ? 'Location Error' :
                                    distance !== null ? `Distance: ${distance}m from Branch` : 'Unknown Location'}
                        </CardDescription>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center ${isCheckedIn ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                        {isCheckedIn ? 'ONLINE' : 'OFFLINE'}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Switch Section */}
                <div className="flex items-center space-x-4 mb-4 mt-2">
                    <Switch
                        id="online-mode"
                        checked={isCheckedIn}
                        onCheckedChange={handleToggleStatus}
                        // Updated Logic:
                        // User requirement: "button should not read only... except if blocked".
                        // Logic: Enable switch regardless of location, unless blocked or loading.
                        disabled={loading || isBlocked}
                        className={!isCheckedIn ? "data-[state=unchecked]:bg-slate-300" : ""}
                    />
                    <Label htmlFor="online-mode" className="font-medium text-slate-700">
                        {loading ? "Updating..." : (isCheckedIn ? "You are Online" : "Go Online")}
                    </Label>
                </div>

                {/* Range Warning */}
                <div className="mb-4">
                    <p className={`text-xs ${canCheckIn ? "text-green-600 font-medium" : "text-amber-600"}`}>
                        {canCheckIn ? "✓ You are within range to check in." : "⚠ You are too far from branch to check in."}
                    </p>
                </div>

                {/* Manual Sync Button */}
                {isCheckedIn && (
                    <Button
                        onClick={handleManualSync}
                        disabled={syncLoading || !position}
                        variant="outline"
                        size="sm"
                        className="w-full bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
                        type="button"
                    >
                        {syncLoading ? "Syncing..." : (!position ? "Waiting for GPS..." : "Update Position Immediately")}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
