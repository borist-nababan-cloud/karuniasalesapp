import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from "@/stores/authStore";
import { supabase } from '@/lib/supabase';
import { getSupabaseMedia } from '@/lib/url';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import CameraCapture from "@/components/CameraCapture";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CreateSpkForm() {
    const navigate = useNavigate();
    const { id: editId } = useParams();
    const user = useAuthStore((state) => state.user);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("customer");

    // Camera/Media State
    const [showCamera, setShowCamera] = useState<{ isOpen: boolean; field: string | null }>({ isOpen: false, field: null });
    const [uploading, setUploading] = useState(false);

    // Data Sources
    const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
    const [vehicleGroups, setVehicleGroups] = useState<any[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<string>("all");
    const [colors, setColors] = useState<any[]>([]);
    const [nextSpkNumber, setNextSpkNumber] = useState<string>("Loading...");

    // Form State
    const [formData, setFormData] = useState({
        namaCustomer: '',
        pekerjaanCustomer: '',
        emailCustomer: '',
        namaDebitur: '',
        alamatCustomer: '',
        noTeleponCustomer: '',

        namaBpkbStnk: '',
        alamatBpkbStnk: '',
        kotaBpkbStnk: '',

        vehicleType: null as number | string | null,
        hargaOtr: 0,
        noMesin: '',
        noRangka: '',
        color: null as number | string | null,
        tahun: new Date().getFullYear().toString(),
        bonus: '',
        lainLain: '',

        caraBayar: 'TUNAI',
        angsuran: 0,
        tandaJadi: 0,
        tenor: '0',
        namaLeasing: '',
        dp: 0,
        pembelianVia: '',
        keterangan: '',

        ktpUrl: '',
        kkUrl: '',
        selfieUrl: '',
    });

    const generateSpkNumber = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let randomCode = '';
        for (let i = 0; i < 5; i++) {
            randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
        const romanMonth = romanMonths[month - 1];
        return `${randomCode}/SPK/${romanMonth}/${year}`;
    };

    useEffect(() => {
        const initData = async () => {
            if (!user) return;

            try {
                const [typeRes, groupRes, colorRes] = await Promise.all([
                    supabase.from('vehicle_types').select('*'),
                    supabase.from('vehicle_groups').select('*'),
                    supabase.from('colors').select('*')
                ]);

                setVehicleTypes(typeRes.data || []);
                setVehicleGroups(groupRes.data || []);
                setColors(colorRes.data || []);

            } catch (error) {
                console.error("Static data init failed", error);
            }

            if (editId) {
                try {
                    const { data: spk, error } = await supabase
                        .from('spks')
                        .select('*')
                        .eq('id', editId)
                        .single();

                    if (error) throw error;

                    if (spk) {
                        setNextSpkNumber(spk.noSPK || spk.no_spk);
                        setFormData(prev => ({
                            ...prev,
                            namaCustomer: spk.namaCustomer || spk.nama_customer || '',
                            pekerjaanCustomer: spk.pekerjaanCustomer || spk.pekerjaan_customer || '',
                            emailCustomer: spk.emailcustomer || spk.email_customer || '',
                            namaDebitur: spk.namaDebitur || spk.nama_debitur || '',
                            alamatCustomer: spk.alamatCustomer || spk.alamat_customer || '',
                            noTeleponCustomer: spk.noTeleponCustomer || spk.no_telepon_customer || '',

                            // Handle both component JSONB and flattened structure possibilities
                            namaBpkbStnk: spk.detailInfo?.namaBpkbStnk || spk.nama_bpkb_stnk || '',
                            alamatBpkbStnk: spk.detailInfo?.alamatBpkbStnk || spk.alamat_bpkb_stnk || '',
                            kotaBpkbStnk: spk.detailInfo?.kotaStnkBpkb || spk.kota_bpkb_stnk || '',

                            vehicleType: spk.vehicle_type_id || spk.unitInfo?.vehicleType?.id || null,
                            hargaOtr: spk.harga_otr || spk.unitInfo?.hargaOtr || 0,
                            noMesin: spk.no_mesin || spk.unitInfo?.noMesin || '',
                            noRangka: spk.no_rangka || spk.unitInfo?.noRangka || '',
                            color: spk.color_id || spk.unitInfo?.color?.id || null,
                            tahun: spk.tahun || spk.unitInfo?.tahun || '',
                            bonus: spk.bonus || spk.unitInfo?.bonus || '',
                            lainLain: spk.lain_lain || spk.unitInfo?.lainLain || '',

                            caraBayar: spk.cara_bayar || spk.paymentInfo?.caraBayar || 'TUNAI',
                            angsuran: spk.angsuran || spk.paymentInfo?.angsuran || 0,
                            tandaJadi: spk.tanda_jadi || spk.paymentInfo?.tandaJadi || 0,
                            tenor: spk.tenor || spk.paymentInfo?.tenor || '0',
                            namaLeasing: spk.nama_leasing || spk.paymentInfo?.namaLeasing || '',
                            dp: spk.dp || spk.paymentInfo?.dp || 0,
                            pembelianVia: spk.pembelian_via || spk.paymentInfo?.pembelianVia || '',
                            keterangan: spk.keterangan || spk.paymentInfo?.keterangan || '',

                            ktpUrl: spk.ktp_url || spk.ktpUrl || '',
                            kkUrl: spk.kk_url || spk.kkUrl || '',
                            selfieUrl: spk.selfie_url || spk.selfieUrl || '',
                        }));
                    }
                } catch (err) {
                    console.error("Failed to fetch SPK details", err);
                    alert("Failed to load SPK data.");
                }
            } else {
                const newSpk = generateSpkNumber();
                setNextSpkNumber(newSpk);
                const saved = localStorage.getItem('spk_draft');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setFormData({
                        ...parsed,
                        vehicleType: typeof parsed.vehicleType === 'object' ? parsed.vehicleType?.id || null : parsed.vehicleType,
                        color: typeof parsed.color === 'object' ? parsed.color?.id || null : parsed.color,
                    });
                }
            }

            setInitialLoading(false);
        };
        initData();
    }, [user, editId]);

    const setField = (field: string, val: any) => {
        setFormData(prev => ({ ...prev, [field]: val }));
    };

    useEffect(() => {
        if (editId && formData.hargaOtr > 0) return;

        const vId = formData.vehicleType;
        if (!vId) return;
        const selectedVehicle = vehicleTypes.find((v: any) => v.id == vId);
        if (selectedVehicle) {
            const price = selectedVehicle.harga_otr || selectedVehicle.price || 0;
            if (!formData.hargaOtr) {
                setField('hargaOtr', price);
            }
        }
    }, [formData.vehicleType, vehicleTypes, editId]);

    const uploadFileToSupabase = async (file: File, fieldName: 'ktp' | 'kk' | 'selfie') => {
        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user?.id}-${fieldName}-${Date.now()}.${fileExt}`;
            const filePath = `uploads/${fileName}`;

            const { error: uploadError } = await supabase.storage.from('spk-documents').upload(filePath, file);

            if (uploadError) throw uploadError;

            if (fieldName === 'ktp') setFormData(prev => ({ ...prev, ktpUrl: filePath }));
            else if (fieldName === 'kk') setFormData(prev => ({ ...prev, kkUrl: filePath }));
            else if (fieldName === 'selfie') setFormData(prev => ({ ...prev, selfieUrl: filePath }));

        } catch (error: any) {
            console.error("Upload failed", error);
            alert(`Upload failed: ${error.message}`);
        } finally {
            setUploading(false);
            setShowCamera({ isOpen: false, field: null });
        }
    };

    const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'ktp' | 'kk' | 'selfie') => {
        if (!e.target.files || e.target.files.length === 0) return;
        uploadFileToSupabase(e.target.files[0], fieldName);
    };

    const nextTab = (target: string) => {
        if (!editId) {
            localStorage.setItem('spk_draft', JSON.stringify(formData));
        }
        setActiveTab(target);
    };

    const handleSubmit = async () => {
        if (!formData.vehicleType) {
            alert("Please select a Vehicle Type.");
            return;
        }
        if (!formData.color) {
            alert("Please select a Color.");
            return;
        }

        setLoading(true);
        try {
            const payloadData: any = {
                noSPK: nextSpkNumber,
                sales_profile_id: user?.id,
                tanggal: new Date().toISOString().split('T')[0],

                namaCustomer: formData.namaCustomer,
                pekerjaanCustomer: formData.pekerjaanCustomer || '-',
                emailcustomer: formData.emailCustomer,
                namaDebitur: formData.namaDebitur,
                alamatCustomer: formData.alamatCustomer,
                kotacustomer: formData.kotaBpkbStnk,
                noTeleponCustomer: formData.noTeleponCustomer,

                detailInfo: {
                    namaBpkbStnk: formData.namaBpkbStnk,
                    alamatBpkbStnk: formData.alamatBpkbStnk,
                    kotaStnkBpkb: formData.kotaBpkbStnk,
                },

                vehicle_type_id: formData.vehicleType,
                harga_otr: Number(formData.hargaOtr) || 0,
                no_mesin: formData.noMesin,
                no_rangka: formData.noRangka,
                color_id: formData.color,
                tahun: String(formData.tahun || ''),
                bonus: formData.bonus,
                lain_lain: formData.lainLain,

                cara_bayar: formData.caraBayar,
                angsuran: Number(formData.angsuran) || 0,
                tanda_jadi: Number(formData.tandaJadi) || 0,
                tenor: String(formData.tenor || ''),
                nama_leasing: formData.namaLeasing,
                dp: Number(formData.dp) || 0,
                pembelian_via: formData.pembelianVia,
                keterangan: formData.keterangan,

                ktp_url: formData.ktpUrl,
                kk_url: formData.kkUrl,
                selfie_url: formData.selfieUrl,
                
                finish: false,
                editable: true
            };

            // Remove empty strings
            Object.keys(payloadData).forEach(key => {
                if (payloadData[key] === '') {
                    payloadData[key] = null;
                }
            });

            if (editId) {
                const { error } = await supabase.from('spks').update(payloadData).eq('id', editId);
                if (error) throw error;
                alert("SPK Updated Successfully!");
            } else {
                const { error } = await supabase.from('spks').insert(payloadData);
                if (error) throw error;
                localStorage.removeItem('spk_draft');
                alert("SPK Created Successfully!");
            }
            navigate('/spk');
        } catch (error: any) {
            console.error("SPK Submission Error:", error);
            alert(`Error: ${error.message || "Unknown error"}`);
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) return <div className="p-8 text-center">Loading Form...</div>;

    return (
        <div className="max-w-xl mx-auto pb-20">
            <h2 className="text-2xl font-bold mb-4">{editId ? 'Edit SPK' : 'New SPK'} <span className="text-sm font-normal text-slate-500">{nextSpkNumber}</span></h2>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-4">
                    <TabsTrigger value="customer">Cust</TabsTrigger>
                    <TabsTrigger value="unit">Unit</TabsTrigger>
                    <TabsTrigger value="payment">Pay</TabsTrigger>
                    <TabsTrigger value="media">Media</TabsTrigger>
                </TabsList>

                {/* TAB 1: CUSTOMER */}
                <TabsContent value="customer">
                    <Card>
                        <CardHeader><CardTitle>A. Customer Information</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nama Customer</Label>
                                <Input value={formData.namaCustomer} onChange={e => setField('namaCustomer', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Pekerjaan Customer</Label>
                                <Input value={formData.pekerjaanCustomer} onChange={e => setField('pekerjaanCustomer', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Email Customer</Label>
                                <Input type="email" value={formData.emailCustomer} onChange={e => setField('emailCustomer', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Nama Debitur</Label>
                                <Input value={formData.namaDebitur} onChange={e => setField('namaDebitur', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>No Telepon</Label>
                                <Input type="tel" value={formData.noTeleponCustomer} onChange={e => setField('noTeleponCustomer', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Alamat Customer</Label>
                                <Input value={formData.alamatCustomer} onChange={e => setField('alamatCustomer', e.target.value)} />
                            </div>

                            <div className="pt-4 border-t">
                                <h3 className="font-semibold mb-2">Paper Information</h3>
                                <div className="space-y-2 mb-2">
                                    <Label>Nama BPKB/STNK</Label>
                                    <Input value={formData.namaBpkbStnk} onChange={e => setField('namaBpkbStnk', e.target.value)} />
                                </div>
                                <div className="space-y-2 mb-2">
                                    <Label>Alamat STNK</Label>
                                    <Input value={formData.alamatBpkbStnk} onChange={e => setField('alamatBpkbStnk', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Kota STNK/BPKB</Label>
                                    <Input value={formData.kotaBpkbStnk} onChange={e => setField('kotaBpkbStnk', e.target.value)} />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={() => nextTab('unit')}>Next</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* TAB 2: UNIT */}
                <TabsContent value="unit">
                    <Card>
                        <CardHeader><CardTitle>B. Unit Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Vehicle Group (Filter)</Label>
                                <Select
                                    value={selectedGroup}
                                    onValueChange={(val) => {
                                        setSelectedGroup(val);
                                        setFormData(prev => ({ ...prev, vehicleType: null }));
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Groups" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Groups</SelectItem>
                                        {vehicleGroups.map((g: any) => (
                                            <SelectItem key={g.id} value={g.id.toString()}>
                                                {g.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Vehicle Type</Label>
                                <Select
                                    value={formData.vehicleType?.toString() || ''}
                                    onValueChange={(idStr) => {
                                        setFormData(prev => ({ ...prev, vehicleType: idStr }));
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Vehicle">
                                            {formData.vehicleType ? vehicleTypes.find((v: any) => v.id == formData.vehicleType)?.name : "Select Vehicle"}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {vehicleTypes
                                            .filter((v: any) => {
                                                if (!selectedGroup || selectedGroup === "all") return true;
                                                const selectedGroupObj = vehicleGroups.find((g: any) => g.id.toString() === selectedGroup);
                                                return v.vehicle_group === selectedGroupObj?.name;
                                            })
                                            .map((v: any) => (
                                                <SelectItem key={v.id} value={v.id.toString()}>
                                                    {v.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Harga OTR</Label>
                                <Input type="number" value={formData.hargaOtr} onChange={e => setField('hargaOtr', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>No Mesin</Label>
                                    <Input value={formData.noMesin} onChange={e => setField('noMesin', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>No Rangka</Label>
                                    <Input value={formData.noRangka} onChange={e => setField('noRangka', e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Color</Label>
                                <Select
                                    value={formData.color?.toString() || ''}
                                    onValueChange={(idStr) => {
                                        setFormData(prev => ({ ...prev, color: idStr }));
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Color">
                                            {formData.color ? colors.find((c: any) => c.id == formData.color)?.colorname || colors.find((c: any) => c.id == formData.color)?.name : "Select Color"}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {colors.map((c: any) => (
                                            <SelectItem key={c.id} value={c.id.toString()}>
                                                {c.colorname || c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Tahun</Label>
                                <Input type="number" value={formData.tahun} onChange={e => setField('tahun', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Bonus</Label>
                                <Textarea value={formData.bonus} onChange={e => setField('bonus', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Tambahan Lainnya</Label>
                                <Input value={formData.lainLain} onChange={e => setField('lainLain', e.target.value)} />
                            </div>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                            <Button variant="outline" className="flex-1" onClick={() => nextTab('customer')}>Back</Button>
                            <Button className="flex-1" onClick={() => nextTab('payment')}>Next</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* TAB 3: PAYMENT */}
                <TabsContent value="payment">
                    <Card>
                        <CardHeader><CardTitle>C. Payment Information</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Cara Bayar</Label>
                                <Select value={formData.caraBayar} onValueChange={v => setField('caraBayar', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TUNAI">TUNAI</SelectItem>
                                        <SelectItem value="KREDIT">KREDIT</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Angsuran</Label>
                                    <Input type="number" value={formData.angsuran} onChange={e => setField('angsuran', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tanda Jadi</Label>
                                    <Input type="number" value={formData.tandaJadi} onChange={e => setField('tandaJadi', e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tenor</Label>
                                    <Input type="number" value={formData.tenor} onChange={e => setField('tenor', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Down Payment (DP)</Label>
                                    <Input type="number" value={formData.dp} onChange={e => setField('dp', e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Nama Leasing</Label>
                                <Input value={formData.namaLeasing} onChange={e => setField('namaLeasing', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Pembelian Via</Label>
                                <Input value={formData.pembelianVia} onChange={e => setField('pembelianVia', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Keterangan</Label>
                                <Textarea value={formData.keterangan} onChange={e => setField('keterangan', e.target.value)} />
                            </div>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                            <Button variant="outline" className="flex-1" onClick={() => nextTab('unit')}>Back</Button>
                            <Button className="flex-1" onClick={() => nextTab('media')}>Next</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* TAB 4: MEDIA */}
                <TabsContent value="media">
                    <Card>
                        <CardHeader><CardTitle>D. Media Upload</CardTitle><CardDescription>Upload KTP, KK, and Selfie</CardDescription></CardHeader>
                        <CardContent className="space-y-6">
                            {/* KTP */}
                            <div className="space-y-2">
                                <Label>KTP Image {formData.ktpUrl && "✅"}</Label>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => setShowCamera({ isOpen: true, field: 'ktp' })}>Camera</Button>
                                    <Input type="file" className="hidden" id="ktp-upload" accept="image/*" onChange={e => handleMediaSelect(e, 'ktp')} />
                                    <Button variant="outline" onClick={() => document.getElementById('ktp-upload')?.click()}>Gallery</Button>
                                </div>
                                {formData.ktpUrl && <img src={getSupabaseMedia(formData.ktpUrl) || ''} className="h-20 w-auto rounded border" />}
                            </div>

                            {/* KK */}
                            <div className="space-y-2">
                                <Label>KK Image {formData.kkUrl && "✅"}</Label>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => setShowCamera({ isOpen: true, field: 'kk' })}>Camera</Button>
                                    <Input type="file" className="hidden" id="kk-upload" accept="image/*" onChange={e => handleMediaSelect(e, 'kk')} />
                                    <Button variant="outline" onClick={() => document.getElementById('kk-upload')?.click()}>Gallery</Button>
                                </div>
                                {formData.kkUrl && <img src={getSupabaseMedia(formData.kkUrl) || ''} className="h-20 w-auto rounded border" />}
                            </div>

                            {/* SELFIE */}
                            <div className="space-y-2">
                                <Label>Selfie with Customer {formData.selfieUrl && "✅"}</Label>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => setShowCamera({ isOpen: true, field: 'selfie' })}>Camera</Button>
                                    <Input type="file" className="hidden" id="selfie-upload" accept="image/*" onChange={e => handleMediaSelect(e, 'selfie')} />
                                    <Button variant="outline" onClick={() => document.getElementById('selfie-upload')?.click()}>Gallery</Button>
                                </div>
                                {formData.selfieUrl && <img src={getSupabaseMedia(formData.selfieUrl) || ''} className="h-20 w-auto rounded border" />}
                            </div>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                            <Button variant="outline" className="flex-1" onClick={() => nextTab('payment')}>Back</Button>
                            <Button className="flex-1" onClick={handleSubmit} disabled={loading || uploading}>
                                {loading ? 'Submitting...' : (editId ? 'Update SPK' : 'Create SPK')}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Camera Modal */}
            {showCamera.isOpen && (
                <CameraCapture
                    onCapture={(file) => {
                        if (showCamera.field) uploadFileToSupabase(file, showCamera.field as any);
                    }}
                    onClose={() => setShowCamera({ isOpen: false, field: null })}
                />
            )}
        </div>
    );
}
