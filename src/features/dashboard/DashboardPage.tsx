import { useState, useEffect } from 'react';
import { useAuthStore } from "@/stores/authStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { api } from '@/lib/axios';

export default function DashboardPage() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const [salesUid, setSalesUid] = useState<string | null>(null);
    const [salesProfile, setSalesProfile] = useState<any>(null);
    const [spkList, setSpkList] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // 1. Fetch Sales UID
    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                const res = await api.get('/sales-profiles', {
                    params: { filters: { email: { $eq: user.email } } }
                });
                if (res.data?.data?.length > 0) {
                    const profileData = res.data.data[0];
                    setSalesUid(profileData.sales_uid);
                    setSalesProfile(profileData);
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            }
        };
        fetchProfile();
    }, [user]);

    // 2. Fetch SPKs
    useEffect(() => {
        const fetchSpks = async () => {
            if (!salesUid) return;
            setLoading(true);
            try {
                const res = await api.get('/spks', {
                    params: {
                        filters: { salesProfile: { sales_uid: { $eq: salesUid } } },
                        populate: ['unitInfo', 'unitInfo.vehicleType'],
                        sort: ['createdAt:desc']
                    }
                });
                setSpkList(res.data?.data || []);
            } catch (err) {
                console.error("Failed to fetch SPKs", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSpks();
    }, [salesUid]);

    const onProgressItems = spkList.filter(item => !item.finish);
    const finishItems = spkList.filter(item => item.finish);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
                <Button onClick={() => navigate('/spk/create')} size="sm" className="gap-2">
                    <Plus className="h-4 w-4" /> New SPK
                </Button>
            </div>
            <div className="text-sm text-gray-500 mb-4">
                Hello, <span className="font-semibold text-gray-900">{user?.username}</span>
            </div>

            {loading && <div className="text-center py-4">Loading data...</div>}

            {!loading && (
                <Tabs defaultValue="on_progress" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="on_progress">On Progress</TabsTrigger>
                        <TabsTrigger value="finish">Finish</TabsTrigger>
                    </TabsList>

                    <TabsContent value="on_progress" className="space-y-4">
                        {onProgressItems.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">No items on progress.</p>
                        ) : (
                            onProgressItems.map(item => (
                                <SpkItemCard key={item.id} item={item} navigate={navigate} salesProfile={salesProfile} />
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="finish" className="space-y-4">
                        {finishItems.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">No finished items.</p>
                        ) : (
                            finishItems.map(item => (
                                <SpkItemCard key={item.id} item={item} navigate={navigate} salesProfile={salesProfile} />
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            )}
        </div >
    )
}

import SpkActions from '../spk/components/SpkActionsNew';

// ... (inside SpkItemCard)

function SpkItemCard({ item, navigate, salesProfile }: { item: any, navigate: any, salesProfile: any }) {
    const isEditable = item.editable;
    const vehicleName = item.unitInfo?.vehicleType?.name || item.vehicleType?.name || '-';

    const handleEdit = (data: any) => {
        navigate(`/spk/edit/${data.documentId || data.id}`);
    };

    // Inject salesProfile into data
    const itemWithProfile = { ...item, salesProfile };

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{item.namaCustomer}</CardTitle>
                        <CardDescription>{item.noSPK} • {item.tanggal}</CardDescription>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isEditable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {isEditable ? 'Editable' : 'Read Only'}
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center">
                    <p className="font-medium">{vehicleName}</p>
                    <div className="flex gap-2">
                        {isEditable && (
                            <SpkActions data={itemWithProfile} onEdit={handleEdit} />
                        )}
                        {!isEditable && !item.finish && (
                            <Button variant="secondary" size="sm">Upload Payment</Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
