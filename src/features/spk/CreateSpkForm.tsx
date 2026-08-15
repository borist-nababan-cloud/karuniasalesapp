import { useState, useEffect } from 'react';
import { Check, X, Camera, MapPin, Search, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import CameraCapture from "@/components/CameraCapture";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type SPKData, SpkSchema } from '@karunia/shared';

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

        caraBayarTj: 'TUNAI',
        ketTj: '',
        tandaJadi: 0,
        pembelianVia: 'KREDIT',
        namaLeasing: '',
        dp: 0,
        angsuran: 0,
        tenorTahun: '0',
        tenorBulan: '0',
        asuransi: '',
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

            let staticTypeData: any[] = [];
            let staticGroupData: any[] = [];

            try {
                const [typeRes, groupRes, colorRes] = await Promise.all([
                    supabase.from('vehicle_types').select('*'),
                    supabase.from('vehicle_groups').select('*'),
                    supabase.from('colors').select('*')
                ]);

                staticTypeData = typeRes.data || [];
                staticGroupData = groupRes.data || [];

                setVehicleTypes(staticTypeData);
                setVehicleGroups(staticGroupData);
                setColors(colorRes.data || []);

            } catch (error) {
            }

            if (editId) {
                try {
                    const { data: spk, error } = await supabase
                        .from('spks')
                        .select(`
                            *,
                            spk_section_details(*),
                            spk_section_units(*),
                            spk_section_payments(*)
                        `)
                        .eq('id', editId)
                        .single();

                    if (error) {
                        throw error;
                    }


                    if (spk) {
                        // PostgREST returns an object (not an array) if a UNIQUE constraint exists on the foreign key.
                        // We must handle both Array and Object structures to prevent undefined mapping.
                        const extractSection = (section: any) => {
                            if (Array.isArray(section)) return section[0] || {};
                            return section || {};
                        };

                        const detail = extractSection(spk.spk_section_details);
                        const unit = extractSection(spk.spk_section_units);
                        const payment = extractSection(spk.spk_section_payments);


                        // Resolve vehicle group for better UX
                        let resolvedGroupId = "all";
                        if (unit.vehicle_type_id) {
                            const vt = staticTypeData.find((v: any) => v.id == unit.vehicle_type_id);
                            if (vt) {
                                const vg = staticGroupData.find((g: any) => g.name === vt.vehicle_group);
                                if (vg) {
                                    resolvedGroupId = vg.id.toString();
                                    setSelectedGroup(resolvedGroupId);
                                } else {
                                }
                            } else {
                            }
                        }

                        setNextSpkNumber(spk.no_spk);
                        
                            const totalTenor = payment.tenor ? Number(payment.tenor) : 0;
                            const newFormData = {
                                namaCustomer: spk.nama_customer || '',
                                pekerjaanCustomer: spk.pekerjaan_customer || '',
                                emailCustomer: spk.email_customer || '',
                                namaDebitur: spk.nama_debitur || '',
                                alamatCustomer: spk.alamat_customer || '',
                                noTeleponCustomer: spk.no_telepon_customer || '',

                                namaBpkbStnk: detail.nama_bpkb_stnk || '',
                                alamatBpkbStnk: detail.alamat_bpkb_stnk || '',
                                kotaBpkbStnk: detail.kota_stnk_bpkb || '',

                                vehicleType: unit.vehicle_type_id ? unit.vehicle_type_id.toString() : null,
                                hargaOtr: unit.harga_otr || 0,
                                noMesin: unit.no_mesin || '',
                                noRangka: unit.no_rangka || '',
                                color: unit.color_id ? unit.color_id.toString() : null,
                                tahun: unit.tahun || '',
                                bonus: unit.bonus || '',
                                lainLain: unit.lain_lain || '',

                                caraBayarTj: payment.cara_bayar_tj || 'TUNAI',
                                ketTj: payment.ket_tj || '',
                                tandaJadi: payment.tanda_jadi || 0,
                                pembelianVia: payment.pembelian_via || 'KREDIT',
                                namaLeasing: payment.nama_leasing || '',
                                dp: payment.dp || 0,
                                angsuran: payment.angsuran || 0,
                                tenorTahun: Math.floor(totalTenor / 12).toString(),
                                tenorBulan: (totalTenor % 12).toString(),
                                asuransi: payment.asuransi || '',
                                keterangan: payment.keterangan || '',

                            ktpUrl: spk.ktp_url || '',
                            kkUrl: spk.kk_url || '',
                            selfieUrl: spk.selfie_url || '',
                        };
                        
                        setFormData(prev => ({ ...prev, ...newFormData }));
                    }
                } catch (err) {
                    alert("Terjadi kesalahan pada sistem, silakan hubungi tim IT.");
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
    }, [user?.id, editId]);

    const setField = (field: string, val: any) => {
        setFormData(prev => ({ ...prev, [field]: val }));
    };

    const formatCurrency = (val: any) => {
        if (!val && val !== 0) return '';
        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const handleNumberChange = (field: string, rawValue: string) => {
        const numericValue = rawValue.replace(/\D/g, '');
        setField(field, numericValue ? Number(numericValue) : 0);
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
            alert("Terjadi kesalahan pada sistem, silakan hubungi tim IT.");
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
        try {
            SpkSchema.parse({
                customer_name: formData.namaCustomer,
                vehicle_type_id: String(formData.vehicleType || ''),
                price: Number(formData.hargaOtr) || 0,
            } as SPKData);
        } catch (e: any) {
            let errorMsg = e.message;
            try {
                const parsedErrs = JSON.parse(e.message);
                if (Array.isArray(parsedErrs) && parsedErrs.length > 0) {
                    errorMsg = parsedErrs.map((err: any) => err.message).join(', ');
                }
            } catch {
                // Not JSON, just use original message
            }
            alert(`Validasi Gagal: ${errorMsg}`);
            return;
        }

        if (!formData.color) {
            alert("Silakan pilih warna kendaraan.");
            return;
        }

        setLoading(true);
        try {
            // 0. Resolve Sales Profile BigInt ID from UUID
            let salesProfileId = null;
            if (user?.id) {
                const { data: profile, error: profileErr } = await supabase
                    .from('sales_profiles')
                    .select('id')
                    .eq('sales_uid', user.id)
                    .maybeSingle();
                
                if (profileErr) {
                } else if (profile) {
                    salesProfileId = profile.id;
                } else {
                }
            }

            // 1. SPKS Core Table
            const spksPayload = {
                no_spk: nextSpkNumber,
                sales_profile_id: salesProfileId,
                tanggal: new Date().toISOString().split('T')[0],
                nama_customer: formData.namaCustomer || null,
                pekerjaan_customer: formData.pekerjaanCustomer || '-',
                email_customer: formData.emailCustomer || null,
                nama_debitur: formData.namaDebitur || null,
                alamat_customer: formData.alamatCustomer || null,
                kota_customer: formData.kotaBpkbStnk || null,
                no_telepon_customer: formData.noTeleponCustomer || null,
                ktp_url: formData.ktpUrl || null,
                kk_url: formData.kkUrl || null,
                selfie_url: formData.selfieUrl || null,
                finish: false,
                editable: true
            };

            // 2. SPK Section Details
            const detailsPayload = {
                nama_bpkb_stnk: formData.namaBpkbStnk || null,
                alamat_bpkb_stnk: formData.alamatBpkbStnk || null,
                kota_stnk_bpkb: formData.kotaBpkbStnk || null,
            };

            // 3. Unit Section
            const unitsPayload = {
                vehicle_type_id: formData.vehicleType ? parseInt(formData.vehicleType as string, 10) : null,
                harga_otr: formData.hargaOtr,
                no_mesin: formData.noMesin,
                no_rangka: formData.noRangka,
                color_id: formData.color ? parseInt(formData.color as string, 10) : null,
                tahun: formData.tahun,
                bonus: formData.bonus,
                lain_lain: formData.lainLain
            };

            // 4. SPK Section Payments
            const tTahun = Number(formData.tenorTahun) || 0;
            const tBulan = Number(formData.tenorBulan) || 0;
            const totalTenor = (tTahun * 12) + tBulan;

            const paymentsPayload = {
                cara_bayar_tj: formData.caraBayarTj || null,
                ket_tj: formData.ketTj || null,
                tanda_jadi: Number(formData.tandaJadi) || 0,
                pembelian_via: formData.pembelianVia || 'KREDIT',
                nama_leasing: formData.namaLeasing || null,
                dp: Number(formData.dp) || 0,
                angsuran: Number(formData.angsuran) || 0,
                tenor: totalTenor,
                asuransi: formData.asuransi || null,
                keterangan: formData.keterangan || null,
            };

            if (editId) {
                // Update Core
                const { error: errSpk } = await supabase.from('spks').update(spksPayload).eq('id', editId);
                if (errSpk) {
                    throw errSpk;
                }

                // Upsert Relations (handles both existing relations and legacy SPKs that lack them)
                
                const { error: errDet } = await supabase.from('spk_section_details')
                    .upsert({ spk_id: editId, ...detailsPayload }, { onConflict: 'spk_id' });

                const { error: errUni } = await supabase.from('spk_section_units')
                    .upsert({ spk_id: editId, ...unitsPayload }, { onConflict: 'spk_id' });

                const { error: errPay } = await supabase.from('spk_section_payments')
                    .upsert({ spk_id: editId, ...paymentsPayload }, { onConflict: 'spk_id' });

                alert("SPK Berhasil Diperbarui!");
            } else {
                // Insert Core
                const { data: spkData, error: errSpk } = await supabase
                    .from('spks')
                    .insert(spksPayload)
                    .select('id')
                    .single();
                if (errSpk) throw errSpk;

                const newSpkId = spkData.id;

                // Insert Relations using generated SPK ID
                
                const { error: errDetails } = await supabase.from('spk_section_details').insert({ spk_id: newSpkId, ...detailsPayload }).select();
                
                const { error: errUnits } = await supabase.from('spk_section_units').insert({ spk_id: newSpkId, ...unitsPayload }).select();
                
                const { error: errPayments } = await supabase.from('spk_section_payments').insert({ spk_id: newSpkId, ...paymentsPayload }).select();

                localStorage.removeItem('spk_draft');
                alert("SPK Berhasil Dibuat!");
            }
            navigate('/spk');
        } catch (error: any) {
            alert("Terjadi kesalahan pada sistem, silakan hubungi tim IT.");
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

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
                        <CardContent className="space-y-6">
                            {/* Group: Tanda Jadi */}
                            <div className="space-y-4 border p-4 rounded-md">
                                <h3 className="font-semibold text-lg text-slate-700">Tanda Jadi</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Nilai Tanda Jadi</Label>
                                        <Input value={formatCurrency(formData.tandaJadi)} onChange={e => handleNumberChange('tandaJadi', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Cara Bayar</Label>
                                        <Select value={formData.caraBayarTj} onValueChange={v => setField('caraBayarTj', v)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="TUNAI">TUNAI</SelectItem>
                                                <SelectItem value="TRANSFER">TRANSFER</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Keterangan Tanda Jadi</Label>
                                    <Input value={formData.ketTj} onChange={e => setField('ketTj', e.target.value)} />
                                </div>
                            </div>

                            {/* Group: Pembelian Via */}
                            <div className="space-y-4 border p-4 rounded-md">
                                <h3 className="font-semibold text-lg text-slate-700">Pembelian Via</h3>
                                <RadioGroup value={formData.pembelianVia} onValueChange={v => setField('pembelianVia', v)} className="flex gap-4">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="TUNAI" id="r-tunai" />
                                        <Label htmlFor="r-tunai">TUNAI</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="KREDIT" id="r-kredit" />
                                        <Label htmlFor="r-kredit">KREDIT</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Group: Kredit Detail */}
                            {formData.pembelianVia === 'KREDIT' && (
                                <div className="space-y-4 border p-4 rounded-md bg-slate-50">
                                    <h3 className="font-semibold text-lg text-slate-700">Kredit Detail</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Nama Leasing</Label>
                                            <Input value={formData.namaLeasing} onChange={e => setField('namaLeasing', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Down Payment (DP)</Label>
                                            <Input value={formatCurrency(formData.dp)} onChange={e => handleNumberChange('dp', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Angsuran</Label>
                                            <Input value={formatCurrency(formData.angsuran)} onChange={e => handleNumberChange('angsuran', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Tenor</Label>
                                            <div className="flex gap-2">
                                                <div className="flex-1 flex items-center gap-2">
                                                    <Input type="number" className="w-16" value={formData.tenorTahun} onChange={e => setField('tenorTahun', e.target.value)} />
                                                    <span className="text-sm">Tahun</span>
                                                </div>
                                                <div className="flex-1 flex items-center gap-2">
                                                    <Input type="number" className="w-16" value={formData.tenorBulan} onChange={e => setField('tenorBulan', e.target.value)} />
                                                    <span className="text-sm">Bulan</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <Label>Asuransi</Label>
                                            <Input value={formData.asuransi} onChange={e => setField('asuransi', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Keterangan Tambahan</Label>
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
