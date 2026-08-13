import { useState, useEffect, useCallback, useRef } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { calculateBranchDistance, isWithinRadius } from '@karunia/shared';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch'; // Import Switch
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

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
    const [isAbsenLoading, setIsAbsenLoading] = useState(false);
    const [absenResult, setAbsenResult] = useState<{success: boolean, message: string} | null>(null);

    // Ref to hold latest position without triggering effect re-runs for interval
    const positionRef = useRef(position);

    useEffect(() => {
        positionRef.current = position;
    }, [position]);

    // Check Geofence (Visual feedback only)
    useEffect(() => {
        if (position) {
            const distance = calculateBranchDistance({
                userLat: position.latitude,
                userLng: position.longitude,
                branchLat: BRANCH_LOCATION.latitude,
                branchLng: BRANCH_LOCATION.longitude
            });
            setDistance(distance);
            setCanCheckIn(isWithinRadius(distance, BRANCH_LOCATION.radius));
        }
    }, [position]);

    const updateLocation = useCallback(async (currentPos: { latitude: number; longitude: number }, isManual = false) => {
        if (!currentPos) return;
        try {
            await supabase.rpc('log_sales_position', {
                p_user_id: profileId,
                p_lat: currentPos.latitude,
                p_lon: currentPos.longitude,
                p_activity_type: isManual ? 'MANUAL_SYNC' : 'AUTO_SYNC'
            });
        } catch (error) {
            console.error("Location sync failed", error);
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
            await supabase
                .from('user_profiles')
                .update({ online_stat: checked })
                .eq('id', profileId);

            setIsCheckedIn(checked);

            // If turning ON, sync location immediately using latest ref or current position
            if (checked && positionRef.current) {
                await updateLocation(positionRef.current, true);
            }
        } catch (error) {
            alert("Terjadi kesalahan pada sistem, gagal memperbarui status absensi.");
        } finally {
            setLoading(false);
        }
    };

    // Manual "Set Position" Handler
    const handleManualSync = async () => {
        if (!position) {
            alert("Menunggu lokasi GPS...");
            return;
        }
        setSyncLoading(true);
        try {
            await updateLocation(position, true);
            alert("Posisi berhasil diperbarui!");
        } catch (error) {
            alert("Terjadi kesalahan sistem, gagal memperbarui posisi.");
        } finally {
            setSyncLoading(false);
        }
    };

    // Absen Harian Handler
    const handleAbsenHarian = async () => {
        if (!position) {
            alert("Menunggu lokasi GPS...");
            return;
        }

        setIsAbsenLoading(true);
        setAbsenResult(null);

        try {
            const { data, error } = await supabase.rpc('log_daily_attendance', {
                p_user_id: profileId,
                p_lat: position.latitude,
                p_lon: position.longitude
            });

            if (error) throw error;

            setAbsenResult({
                success: data.success,
                message: data.message
            });
            
            if (data.success) {
                // Optionally clear the message after 10 seconds
                setTimeout(() => setAbsenResult(null), 10000);
            }

        } catch (error) {
            console.error("Absen error:", error);
            setAbsenResult({
                success: false,
                message: "Terjadi kesalahan sistem saat melakukan absensi."
            });
        } finally {
            setIsAbsenLoading(false);
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
                                geoError ? `Location Error: ${geoError}` :
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

                {/* Absen Harian Button */}
                <div className="mt-4 pt-4 border-t border-blue-200">
                    <Button
                        onClick={handleAbsenHarian}
                        disabled={isAbsenLoading || !position || isBlocked}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        type="button"
                    >
                        {isAbsenLoading ? "Memproses Absen..." : (!position ? "Waiting for GPS..." : "Absen Harian (Catat Kehadiran)")}
                    </Button>
                    {absenResult && (
                        <p className={`mt-2 text-sm text-center font-medium ${absenResult.success ? 'text-green-600' : 'text-red-500'}`}>
                            {absenResult.message}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
