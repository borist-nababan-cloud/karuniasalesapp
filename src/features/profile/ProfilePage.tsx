import { useEffect, useState } from 'react';
import { User, Key, Save, Camera, Edit2, LogOut, Loader2 } from 'lucide-react';
import { useAuthStore } from "@/stores/authStore";
import { supabase } from '@/lib/supabase';
import QRCode from "react-qr-code";

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
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [formData, setFormData] = useState<any>({});


    useEffect(() => {
        if (!user?.id) return;

        const fetchProfile = async () => {
            try {
                const { data, error } = await supabase
                    .from('user_profiles')
                    .select('*, supervisors!user_profiles_supervisor_id_fkey(namasupervisor)')
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
                console.error("fetchProfile error:", error);
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
                phone: formData.phone,
                whatsapp: formData.whatsapp,
            };

            const updateId = profile?.id;

            if (!updateId) {
                alert("Terjadi kesalahan sistem: ID profil tidak ditemukan.");
                return;
            }

            const { error } = await supabase
                .from('user_profiles')
                .update(payload)
                .eq('id', updateId);

            if (error) throw error;

            setProfile({ ...profile, ...payload });
            setIsEditing(false);
            alert("Profil Berhasil Diperbarui!");
        } catch (error) {
            alert("Terjadi kesalahan pada sistem saat memperbarui profil, silakan hubungi tim IT.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0) {
                return;
            }
            const file = event.target.files[0];
            setIsUploadingAvatar(true);

            const fileExt = file.name.split('.').pop();
            const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to Supabase 'avatars' bucket
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) {
                throw uploadError;
            }

            // Update user profile in database
            const { error: updateError } = await supabase
                .from('user_profiles')
                .update({ avatar: filePath })
                .eq('id', user?.id);

            if (updateError) {
                throw updateError;
            }

            // Update local state
            setProfile((prev: any) => ({ ...prev, avatar: filePath }));
        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            alert("Terjadi kesalahan pada sistem saat mengunggah, silakan hubungi tim IT.");
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    if (!user) return <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
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
                            <div className="relative group cursor-pointer mb-2">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    id="avatar-upload"
                                    onChange={handleAvatarUpload}
                                    disabled={isUploadingAvatar}
                                />
                                <label htmlFor="avatar-upload" className="cursor-pointer block">
                                    <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold overflow-hidden border-2 border-slate-200 relative">
                                        {isUploadingAvatar ? (
                                            <span className="text-sm font-normal">...</span>
                                        ) : profile?.avatar ? (
                                            <img
                                                src={getSupabaseMedia(profile.avatar, 'avatars') || ''}
                                                alt="Profile"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span>{profile?.full_name?.charAt(0).toUpperCase() || "U"}</span>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white text-xs">Edit</span>
                                        </div>
                                    </div>
                                </label>
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
                                <span className="font-medium">{profile?.supervisors?.namasupervisor || "-"}</span>
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


        </div>
    );
}
