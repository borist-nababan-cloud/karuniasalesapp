import { useEffect, useState } from 'react';
import { useAuthStore } from "@/stores/authStore";
import { api } from '@/lib/axios';
import QRCode from "react-qr-code";
import CameraCapture from "@/components/CameraCapture";
import AttendanceCard from '@/features/attendance/AttendanceCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Mock Profile Img URL (if needed)
import { ENV } from "../../config/env";
import { getStrapiMedia } from "@/lib/url";

const BASE_URL_PROFILE = ENV.QR_BASE_URL;

// Mock removed to prevent confusion.


export default function ProfilePage() {
    const user = useAuthStore((state) => state.user);
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [uploading, setUploading] = useState(false);
    const [showCamera, setShowCamera] = useState(false);

    // Refactored Upload Logic to be reusable
    const uploadFileToStrapi = async (file: File) => {
        setUploading(true);
        try {
            const data = new FormData();
            data.append('files', file);
            data.append('ref', 'api::sales-profile.sales-profile');
            // Use documentId if available, fallback to id (or just string conversion)
            // But 'refId' field in Strapi Upload usually expects the numeric ID unless using DocumentID standard in v5.
            // Let's try numeric ID first as that is standard for 'refId'. If fails, we might need another approach.
            // Actually, for Strapi v5 media linking, sticking to numeric ID for 'refId' is often still the way for the Upload plugin, 
            // OR we update the entry itself with the media ID.
            if (!profile?.id) {
                alert("Please save your profile details first before uploading a photo.");
                return;
            }

            // data.append('refId', profile.id.toString());
            // Use documentId if available, fallback to id for Strapi v4/v5 compatibility
            data.append('refId', (profile.id || profile.documentId).toString());
            data.append('field', 'photo_profile');



            const uploadRes = await api.post('/upload', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });



            if (uploadRes.data && uploadRes.data.length > 0) {
                const uploadedFile = uploadRes.data[0];
                const photoUrl = uploadedFile.url;

                const newPhotoState = { url: photoUrl };
                setProfile((prev: any) => ({ ...prev, photo_profile: newPhotoState }));
                alert("Photo uploaded successfully!");
            }
        } catch (error: any) {
            console.error("Upload failed", error);
            alert(`Upload failed: ${error.response?.data?.error?.message || "Check connection"}`);
        } finally {
            setUploading(false);
            setShowCamera(false); // Close camera if open
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        await uploadFileToStrapi(file);
    };

    const handleCameraCapture = async (file: File) => {
        await uploadFileToStrapi(file);
    };

    // Fetch Profile
    useEffect(() => {
        if (!user) return;

        const fetchProfile = async () => {
            try {
                // Try to find profile by email
                // In real Strapi: GET /sales-profiles?filters[email][$eq]=user.email
                const response = await api.get(`/sales-profiles`, {
                    params: {
                        filters: {
                            email: {
                                $eq: user.email
                            }
                        },
                        populate: '*'
                    }
                });

                if (response.data?.data?.length > 0) {
                    const fetchedData = response.data.data[0]; // Strapi v4 response structure
                    // Handle wrapped attributes if using Strapi v4 default
                    const profileData = fetchedData.attributes ? { id: fetchedData.id, ...fetchedData.attributes } : fetchedData;
                    setProfile(profileData);
                    setFormData(profileData);
                } else {
                    // No profile found

                    setProfile(null); // Explicit null
                    setFormData({});
                }
            } catch (error: any) {
                console.error("Failed to fetch profile", error);

                if (error.response?.status === 403) {
                    alert("Access Denied: You do not have permission to view this profile. Please contact Admin to check 'Authenticated' Role permissions for 'sales-profiles'.");
                }

                // Do NOT fallback to mock silently
                setProfile(null);
                setFormData({});
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // Update logic (REAL)
            // Filter out read-only fields (id, createdAt, sales_uid, etc) to avoid 400 Bad Request
            const payload = {
                surename: formData.surename,
                address: formData.address,
                city: formData.city,
                province: formData.province,
                phonenumber: formData.phonenumber,
                wanumber: formData.wanumber,
            };

            // Strapi v5 uses documentId for updates, v4 uses id.
            const updateId = profile?.documentId || profile?.id;

            if (!updateId) {
                // Determine if we need to create instead? 
                // For now, alert error if no ID found, as it implies profile fetch failed.
                alert("Error: No profile ID found. Please refresh or contact admin.");
                return;
            }

            await api.put(`/sales-profiles/${updateId}`, { data: payload });

            setProfile(formData);
            setIsEditing(false);
            alert("Profile Updated Successfully!");
        } catch (error) {
            console.error("Failed to update", error);
            alert("Failed to update profile.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return <div className="p-4">Loading...</div>;
    if (isLoading && !profile) return <div className="p-4">Fetching Profile...</div>;

    const qrValue = `${BASE_URL_PROFILE}${profile?.sales_uid || 'UNKNOWN'}`;

    return (
        <div className="max-w-md mx-auto space-y-6 mb-20"> {/* Add margin bottom for nav */}
            <h2 className="text-2xl font-bold tracking-tight">Sales Profile</h2>

            {/* Attendance Section */}
            {profile && <AttendanceCard profileId={profile.documentId || profile.id} initialStatus={profile.online_stat} isBlocked={profile.blocked} />}

            {!profile && !isLoading && (
                <div className="p-8 text-center bg-red-50 rounded border border-red-200 text-red-700">
                    <h3 className="font-bold">Profile Not Loaded</h3>
                    <p className="text-sm">Could not retrieve your profile data. Please check connection or permissions.</p>
                </div>
            )}

            {/* READ ONLY SECTION */}
            {profile && (
                <Card className="bg-slate-50 border-slate-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Identity Card</CardTitle>
                        <CardDescription>Official Sales ID (Read Only)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col items-center mb-4">
                            <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold mb-2 overflow-hidden border-2 border-slate-200">
                                {profile?.photo_profile?.url ? (
                                    <img
                                        src={getStrapiMedia(profile.photo_profile.url) || ''}
                                        alt="Profile"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    // Initials Fallback
                                    <span>{profile?.surename?.charAt(0).toUpperCase() || "U"}</span>
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">{profile?.surename}</h3>
                            <p className="text-sm text-slate-500">{profile?.sales_uid}</p>

                            {/* Status Badges */}
                            <div className="flex gap-2 mt-2">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${profile?.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {profile?.approved ? "APPROVED" : "PENDING"}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${profile?.blocked ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>
                                    {profile?.blocked ? "BLOCKED" : "ACTIVE"}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2 text-sm">
                            <div className="flex justify-between border-b pb-1">
                                <span className="text-gray-500">Email</span>
                                <span className="font-medium">{profile?.email}</span>
                            </div>
                            <div className="flex justify-between border-b pb-1">
                                <span className="text-gray-500">Supervisor</span>
                                <span className="font-medium">{profile?.namasupervisor || "-"}</span>
                            </div>
                        </div>

                        <div className="flex justify-center p-2 bg-white rounded border">
                            <QRCode value={qrValue} size={120} />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* EDITABLE SECTION */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Personal Details</CardTitle>
                    <CardDescription>Manage your contact information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="surename">Full Name (Surename)</Label>
                        <Input
                            id="surename"
                            name="surename"
                            value={formData.surename || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            name="address"
                            value={formData.address || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                name="city"
                                value={formData.city || ''}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="province">Province</Label>
                            <Input
                                id="province"
                                name="province"
                                value={formData.province || ''}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phonenumber">Phone Number</Label>
                        <Input
                            id="phonenumber"
                            name="phonenumber"
                            value={formData.phonenumber || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="wanumber">WhatsApp Number</Label>
                        <Input
                            id="wanumber"
                            name="wanumber"
                            value={formData.wanumber || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                        />
                    </div>

                    {isEditing && (
                        <div className="space-y-2 pt-4 border-t">
                            <Label>Update Profile Photo</Label>
                            <div className="flex gap-2">
                                {/* Camera input: Mobile-first capture */}
                                <div className="relative">
                                    <Button variant="secondary" onClick={() => setShowCamera(true)} disabled={uploading}>
                                        Camera
                                    </Button>
                                </div>

                                {/* Gallery input */}
                                <div className="relative">
                                    <Input
                                        id="gallery-input"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handlePhotoUpload}
                                        disabled={uploading}
                                    />
                                    <Button variant="outline" onClick={() => document.getElementById('gallery-input')?.click()} disabled={uploading}>
                                        Gallery
                                    </Button>
                                </div>
                            </div>
                            {uploading && <p className="text-xs text-blue-500">Uploading...</p>}
                            <p className="text-xs text-gray-500 mt-1">Files are uploaded instantly.</p>
                        </div>
                    )}

                </CardContent>
                <CardFooter>
                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)} className="w-full" variant="outline">
                            Edit Details
                        </Button>
                    ) : (
                        <div className="flex w-full gap-2">
                            <Button onClick={() => setIsEditing(false)} variant="ghost" className="flex-1">
                                Cancel
                            </Button>
                            <Button onClick={handleSave} className="flex-1">
                                Save Changes
                            </Button>
                        </div>
                    )}
                </CardFooter>
            </Card>

            {/* Camera Modal */}
            {showCamera && (
                <CameraCapture
                    onCapture={handleCameraCapture}
                    onClose={() => setShowCamera(false)}
                />
            )}
        </div>
    );
}
