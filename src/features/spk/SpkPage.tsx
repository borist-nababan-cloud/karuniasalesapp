import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from "@/stores/authStore";
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle } from "lucide-react";
import SpkActions from './components/SpkActionsNew';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';

export default function SpkPage() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const [spkList, setSpkList] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("on_progress"); // on_progress | finish

    useEffect(() => {
        const fetchSpks = async () => {
            if (!user?.id) return;
            setLoading(true);
            try {
                // Fetch SPKs for the logged-in user
                let query = supabase
                    .from('spks')
                    .select('*, vehicle_types(name)')
                    .eq('sales_profile_id', user.id)
                    .order('created_at', { ascending: false });

                if (activeTab === 'on_progress') {
                    query = query.eq('finish', false).eq('editable', true);
                } else if (activeTab === 'finish') {
                    query = query.eq('finish', true);
                }

                const { data, error } = await query;
                
                if (error) throw error;
                setSpkList(data || []);
            } catch (err) {
                console.error("Failed to fetch SPKs", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSpks();
    }, [user?.id, activeTab]);

    const handleEdit = (spk: any) => {
        navigate(`/spk/edit/${spk.id}`);
    };

    const columns = useMemo<MRT_ColumnDef<any>[]>(() => [
        {
            accessorKey: 'noSPK',
            header: 'No SPK',
        },
        {
            id: 'customer',
            header: 'Customer',
            Cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.namaCustomer}</div>
                    <div className="text-xs text-slate-500">{row.original.noTeleponCustomer}</div>
                </div>
            )
        },
        {
            id: 'vehicle',
            header: 'Vehicle',
            accessorFn: (row) => row.vehicle_types?.name || '-',
        },
        {
            accessorKey: 'tanggal',
            header: 'Date',
        },
        {
            id: 'actions',
            header: 'Actions',
            Cell: ({ row }) => <SpkActions data={{...row.original, salesProfile: user}} onEdit={handleEdit} />,
        }
    ], [user]);

    const table = useMaterialReactTable({
        columns,
        data: spkList,
        state: { isLoading: loading },
        initialState: {
            pagination: { pageSize: 10, pageIndex: 0 },
        },
    });

    return (
        <div className="container mx-auto p-4 pb-20">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">SPK Dashboard</h1>
                    <p className="text-slate-500 text-sm">Manage your vehicle orders</p>
                </div>
                <Button onClick={() => navigate('/spk/create')}>
                    <PlusCircle className="mr-2 h-4 w-4" /> New SPK
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="on_progress">On Progress</TabsTrigger>
                    <TabsTrigger value="finish">Finish</TabsTrigger>
                </TabsList>

                <TabsContent value="on_progress">
                    <Card>
                        <CardContent className="p-0">
                            <MaterialReactTable table={table} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="finish">
                    <Card>
                        <CardContent className="p-0">
                            <MaterialReactTable table={table} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
