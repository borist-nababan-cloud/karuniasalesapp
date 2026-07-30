import { useEffect, useState } from 'react';
import { useAuthStore } from "@/stores/authStore";
import { supabase } from '@/lib/supabase';
import QRCode from "react-qr-code";
import CameraCapture from "@/components/CameraCapture";
import AttendanceCard from '@/features/attendance/AttendanceCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { ENV } from "../../config/env";
import { getSupabaseMedia } from "@/lib/url";

const BASE_URL_PROFILE = ENV.QR_BASE_URL;

export default function ProfilePage() {
    const user = useAuthStore((state) => state.user);
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [uploading, setUploading] = useState(false);
    const [showCamera, setShowCamera] = useState(false);

    const uploadFileToSupabase = async (file: File) => {
        setUploading(true);
        try {
            if (!profile?.id) {
                alert("Please save your profile details first before uploading a photo.");
                return;
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `${profile.id}-photo-${Date.now()}.${fileExt}`;
            const filePath = `profile-photos/${fileName}`;

            const { error: uploadError } = await supabase.storage.from('spk-documents').upload(filePath, file);

            if (uploadError) throw uploadError;

            // Update user profile with the new photo URL
            const { error: updateError } = await supabase
                .from('user_profiles')
                .update({ photo_url: filePath })
                .eq('id', profile.id);

            if (updateError) throw updateError;

            setProfile((prev: any) => ({ ...prev, photo_url: filePath }));
            alert("Photo uploaded successfully!");
        } catch (error: any) {
            console.error("Upload failed", error);
            alert(`Upload failed: ${error.message || "Check connection"}`);
        } finally {
            setUploading(false);
            setShowCamera(false);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        await uploadFileToSupabase(file);
    };

    const handleCameraCapture = async (file: File) => {
        await uploadFileToSupabase(file);
    };

    useEffect(() => {
        if (!user?.id) return;

        const fetchProfile = async () => {
            try {
                const { data, error } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;

                if (data) {
                    setProfile(data);
                    setFormData(data);
                } else {
                    setProfile(null);
                    setFormData({});
                }
            } catch (error: any) {
                console.error("Failed to fetch profile", error);
                setProfile(null);
                setFormData({});
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [user?.id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const payload = {
                full_name: formData.full_name,
                address: formData.address,
                city: formData.city,
                province: formData.province,
                phone: formData.phone,
                whatsapp: formData.whatsapp,
            };

            const updateId = profile?.id;

            if (!updateId) {
                alert("Error: No profile ID found. Please refresh or contact admin.");
                return;
            }

            const { error } = await supabase
                .from('user_profiles')
                .update(payload)
                .eq('id', updateId);

            if (error) throw error;

            setProfile({ ...profile, ...payload });
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

    const qrValue = `${BASE_URL_PROFILE}${profile?.sales_uid || profile?.id || 'UNKNOWN'}`;

    return (
        <div className="max-w-md mx-auto space-y-6 mb-20">
            <h2 className="text-2xl font-bold tracking-tight">Sales Profile</h2>

            {profile && <AttendanceCard profileId={profile.id} initialStatus={profile.online_stat} isBlocked={profile.blocked} />}

            {!profile && !isLoading && (
                <div className="p-8 text-center bg-red-50 rounded border border-red-200 text-red-700">
                    <h3 className="font-bold">Profile Not Loaded</h3>
                    <p className="text-sm">Could not retrieve your profile data. Please check connection or permissions.</p>
                </div>
            )}

            {profile && (
                <Card className="bg-slate-50 border-slate-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Identity Card</CardTitle>
                        <CardDescription>Official Sales ID (Read Only)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col items-center mb-4">
                            <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold mb-2 overflow-hidden border-2 border-slate-200">
                                {profile?.photo_url ? (
                                    <img
                                        src={getSupabaseMedia(profile.photo_url) || ''}
                                        alt="Profile"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span>{profile?.full_name?.charAt(0).toUpperCase() || "U"}</span>
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">{profile?.full_name}</h3>
                            <p className="text-sm text-slate-500">{profile?.sales_uid || profile?.id}</p>

                            <div className="flex gap-2 mt-2">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${profile?.confirmed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {profile?.confirmed ? "APPROVED" : "PENDING"}
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

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Personal Details</CardTitle>
                    <CardDescription>Manage your contact information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                            id="full_name"
                            name="full_name"
                            value={formData.full_name || ''}
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
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            name="phone"
                            value={formData.phone || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="whatsapp">WhatsApp Number</Label>
                        <Input
                            id="whatsapp"
                            name="whatsapp"
                            value={formData.whatsapp || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                        />
                    </div>

                    {isEditing && (
                        <div className="space-y-2 pt-4 border-t">
                            <Label>Update Profile Photo</Label>
                            <div className="flex gap-2">
                                <div className="relative">
                                    <Button variant="secondary" onClick={() => setShowCamera(true)} disabled={uploading}>
                                        Camera
                                    </Button>
                                </div>

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

            {showCamera && (
                <CameraCapture
                    onCapture={handleCameraCapture}
                    onClose={() => setShowCamera(false)}
                />
            )}
        </div>
    );
}
