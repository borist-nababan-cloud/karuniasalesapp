import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from "@/stores/authStore";
import { api } from '@/lib/axios';
import { getStrapiMedia } from '@/lib/url';
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
    const { id: editId } = useParams(); // Get ID from ID
    const user = useAuthStore((state) => state.user);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("customer");

    // Camera/Media State
    const [showCamera, setShowCamera] = useState<{ isOpen: boolean; field: string | null }>({ isOpen: false, field: null });
    const [uploading, setUploading] = useState(false);

    // Data Sources
    const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
    const [vehicleGroups, setVehicleGroups] = useState<any[]>([]); // NEW
    const [selectedGroup, setSelectedGroup] = useState<string>("all"); // NEW
    const [colors, setColors] = useState<any[]>([]);
    const [salesProfileId, setSalesProfileId] = useState<number | null>(null);
    const [nextSpkNumber, setNextSpkNumber] = useState<string>("Loading...");

    // Form State
    const [formData, setFormData] = useState({
        // Root / Customer
        namaCustomer: '',
        pekerjaanCustomer: '',
        emailCustomer: '',
        namaDebitur: '',
        alamatCustomer: '',
        noTeleponCustomer: '',

        // Paper Info (Mapped to detailInfo in backend)
        namaBpkbStnk: '',
        alamatBpkbStnk: '',
        kotaBpkbStnk: '',

        // Unit Info - Store ID only for relations within components
        // Strapi v5 component relations only accept { id: number } during create/update
        vehicleType: null as number | null,
        hargaOtr: 0,
        noMesin: '',
        noRangka: '',
        color: null as number | null,
        tahun: new Date().getFullYear().toString(),
        bonus: '',
        lainLain: '',

        // Payment Info
        caraBayar: 'TUNAI',
        angsuran: 0,
        tandaJadi: 0,
        tenor: '0',
        namaLeasing: '',
        dp: 0,
        pembelianVia: '',
        keterangan: '',

        // Media IDs
        ktpId: null as number | null,
        kkId: null as number | null,
        selfieId: null as number | null,

        // Media URLs for Preview
        ktpUrl: '',
        kkUrl: '',
        selfieUrl: '',
    });

    // Helper: Generate SPK Number
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

    // 1. Fetch Initial Data
    useEffect(() => {
        const initData = async () => {
            if (!user) return;

            // A. Fetch Static Data & Profile
            try {
                const [typeRes, groupRes, colorRes, profileRes] = await Promise.all([
                    api.get('/vehicle-types', { params: { 'pagination[pageSize]': 500, populate: '*' } }), // Populated for relations
                    api.get('/vehicle-groups', { params: { 'pagination[pageSize]': 100 } }), // Fetch Groups
                    api.get('/colors', { params: { 'pagination[pageSize]': 500 } }),
                    api.get('/sales-profiles', { params: { filters: { email: { $eq: user.email } }, populate: '*' } })
                ]);

                const vTypes = typeRes.data?.data || [];
                const vGroups = groupRes.data?.data || [];
                const colors = colorRes.data?.data || [];

                setVehicleTypes(vTypes);
                setVehicleGroups(vGroups);
                setColors(colors);

                if (profileRes.data?.data?.length > 0) {
                    const profile = profileRes.data.data[0];
                    setSalesProfileId(profile.id);
                } else {
                    console.warn("Sales Profile not found for", user.email);
                }
            } catch (error) {
                console.error("Static data init failed", error);
            }

            // B. Fetch SPK Data (If Edit) or Setup New
            if (editId) {
                try {

                    // Use Filter instead of ID lookup to avoid 500
                    const spkRes = await api.get('/spks', {
                        params: {
                            filters: { documentId: { $eq: editId } },
                            populate: '*'
                        }
                    });


                    const spkData = spkRes.data?.data; // Handle { data: [...] }
                    const spk = Array.isArray(spkData) ? spkData[0] : spkData; // Handle if by accident it returns array

                    if (spk) {

                        // Populate Form
                        setNextSpkNumber(spk.noSPK);
                        setFormData(prev => ({
                            ...prev,
                            // Root
                            namaCustomer: spk.namaCustomer || '',
                            pekerjaanCustomer: spk.pekerjaanCustomer || '',
                            emailCustomer: spk.emailcustomer || '',
                            namaDebitur: spk.namaDebitur || '',
                            alamatCustomer: spk.alamatCustomer || '',
                            noTeleponCustomer: spk.noTeleponCustomer || '',

                            // Detail Info
                            namaBpkbStnk: spk.detailInfo?.namaBpkbStnk || '',
                            alamatBpkbStnk: spk.detailInfo?.alamatBpkbStnk || '',
                            kotaBpkbStnk: spk.detailInfo?.kotaStnkBpkb || '',

                            // Unit Info - Store ID only for relations within components
                            vehicleType: spk.unitInfo?.vehicleType?.id || null,
                            hargaOtr: spk.unitInfo?.hargaOtr || 0,
                            noMesin: spk.unitInfo?.noMesin || '',
                            noRangka: spk.unitInfo?.noRangka || '',
                            color: spk.unitInfo?.color?.id || null,
                            tahun: spk.unitInfo?.tahun || '',
                            bonus: spk.unitInfo?.bonus || '',
                            lainLain: spk.unitInfo?.lainLain || '',

                            // Payment Info
                            caraBayar: spk.paymentInfo?.caraBayar || 'TUNAI',
                            angsuran: spk.paymentInfo?.angsuran || 0,
                            tandaJadi: spk.paymentInfo?.tandaJadi || 0,
                            tenor: spk.paymentInfo?.tenor || '0',
                            namaLeasing: spk.paymentInfo?.namaLeasing || '',
                            dp: spk.paymentInfo?.dp || 0,
                            pembelianVia: spk.paymentInfo?.pembelianVia || '',
                            keterangan: spk.paymentInfo?.keterangan || '',

                            // Media
                            ktpId: spk.ktpPaspor?.id || null,
                            ktpUrl: spk.ktpPaspor?.url || '',
                            kkId: spk.kartuKeluarga?.id || null,
                            kkUrl: spk.kartuKeluarga?.url || '',
                            selfieId: spk.selfie?.id || null,
                            selfieUrl: spk.selfie?.url || '',
                        }));
                    } else {
                        console.error("SPK data not found in response");
                    }
                } catch (err) {
                    console.error("Failed to fetch SPK details", err);
                    alert("Failed to load SPK data.");
                }
            } else {
                // Create Mode
                const newSpk = generateSpkNumber();
                setNextSpkNumber(newSpk);
                const saved = localStorage.getItem('spk_draft');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    // FIX: Clean up vehicleType and color if they're stored as full objects instead of IDs
                    const cleanedData = {
                        ...parsed,
                        vehicleType: typeof parsed.vehicleType === 'object' ? parsed.vehicleType?.id || null : parsed.vehicleType,
                        color: typeof parsed.color === 'object' ? parsed.color?.id || null : parsed.color,
                    };
                    setFormData(cleanedData);
                }
            }

            setInitialLoading(false);
        };
        initData();
    }, [user, editId]);

    // Update Field Helper
    const setField = (field: string, val: any) => {
        setFormData(prev => ({ ...prev, [field]: val }));
    };

    // Price Automator (Only if not editing or explicit user change? simplified to always run for now but check if empty)
    useEffect(() => {
        if (editId && formData.hargaOtr > 0) return; // Don't overwrite existing price on edit load

        const vId = formData.vehicleType;
        if (!vId) return;
        const selectedVehicle = vehicleTypes.find((v: any) => v.id === vId);
        if (selectedVehicle) {
            const attr = selectedVehicle.attributes || selectedVehicle;
            const price = attr.harga_otr || attr.price || 0;
            // Only autofill if 0
            if (!formData.hargaOtr) {
                setField('hargaOtr', price);
            }
        }
    }, [formData.vehicleType, vehicleTypes, editId]);

    // Media Upload Logic (Upload on Select)
    const uploadFileToStrapi = async (file: File, fieldName: 'ktp' | 'kk' | 'selfie') => {
        setUploading(true);
        try {
            const data = new FormData();
            data.append('files', file);

            const uploadRes = await api.post('/upload', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (uploadRes.data && uploadRes.data.length > 0) {
                const uploadedFile = uploadRes.data[0];
                const fileId = uploadedFile.id;
                const fileUrl = uploadedFile.url;

                if (fieldName === 'ktp') {
                    setFormData(prev => ({ ...prev, ktpId: fileId, ktpUrl: fileUrl }));
                } else if (fieldName === 'kk') {
                    setFormData(prev => ({ ...prev, kkId: fileId, kkUrl: fileUrl }));
                } else if (fieldName === 'selfie') {
                    setFormData(prev => ({ ...prev, selfieId: fileId, selfieUrl: fileUrl }));
                }
            }
        } catch (error: any) {
            console.error("Upload failed", error);
            alert(`Upload failed: ${error.response?.data?.error?.message || "Check connection"}`);
        } finally {
            setUploading(false);
            setShowCamera({ isOpen: false, field: null });
        }
    };

    const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'ktp' | 'kk' | 'selfie') => {
        if (!e.target.files || e.target.files.length === 0) return;
        uploadFileToStrapi(e.target.files[0], fieldName);
    };

    // Navigation Logic
    const nextTab = (target: string) => {
        if (!editId) {
            localStorage.setItem('spk_draft', JSON.stringify(formData));
        }
        setActiveTab(target);
    };

    const handleSubmit = async () => {
        if (!salesProfileId) {
            alert("Sales Profile not linked. Please re-login or check your profile connection.");
            return;
        }
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
            // Round 19 Fix: Based on actual server error "Invalid key documentId"
            // 1. Top-level relations (salesProfile, ktpPaspor, kartuKeluarga, selfie) use connect syntax:
            //    - { connect: [{ id: X }] }
            // 2. Relations WITHIN components (vehicleType, color in unitInfo) must be { id: number } ONLY:
            //    - NO documentId field allowed for component-embedded relations!
            // 3. Components (detailInfo, unitInfo, paymentInfo) don't need their 'id' field when creating

            // Top-level relations use connect syntax
            const salesProfileConnect = salesProfileId ? { connect: [{ id: salesProfileId }] } : null;
            const ktpPasporConnect = formData.ktpId ? { connect: [{ id: formData.ktpId }] } : null;
            const kartuKeluargaConnect = formData.kkId ? { connect: [{ id: formData.kkId }] } : null;
            const selfieConnect = formData.selfieId ? { connect: [{ id: formData.selfieId }] } : null;

            // FIX: Extract ID from object if vehicleType/color is stored as full object
            // Handle both: number ID (1) and object format ({id: 1, documentId: '...'})
            const vehicleTypeId = typeof formData.vehicleType === 'object' && formData.vehicleType !== null
                ? (formData.vehicleType as { id: number }).id
                : formData.vehicleType as number;
            const colorId = typeof formData.color === 'object' && formData.color !== null
                ? (formData.color as { id: number }).id
                : formData.color as number;

            // Component-embedded relations: { id: number } ONLY - NO documentId!
            const vehicleTypeRelation = vehicleTypeId ? { id: Number(vehicleTypeId) } : null;
            const colorRelation = colorId ? { id: Number(colorId) } : null;

            // Create payload
            const payloadData: any = {
                noSPK: nextSpkNumber,
                salesProfile: salesProfileConnect,
                tanggal: new Date().toISOString().split('T')[0],

                // Customer & Root
                namaCustomer: formData.namaCustomer,
                pekerjaanCustomer: formData.pekerjaanCustomer || '-',
                emailcustomer: formData.emailCustomer,
                namaDebitur: formData.namaDebitur,
                alamatCustomer: formData.alamatCustomer,
                kotacustomer: formData.kotaBpkbStnk,
                noTeleponCustomer: formData.noTeleponCustomer,

                // Paper Info (Component)
                detailInfo: {
                    namaBpkbStnk: formData.namaBpkbStnk,
                    alamatBpkbStnk: formData.alamatBpkbStnk,
                    kotaStnkBpkb: formData.kotaBpkbStnk,
                },

                // Unit Info (Component) - Relations must be FULL objects with id + documentId
                unitInfo: {
                    vehicleType: vehicleTypeRelation,  // Full object: { id, documentId }
                    hargaOtr: Number(formData.hargaOtr) || 0,
                    noMesin: formData.noMesin,
                    noRangka: formData.noRangka,
                    color: colorRelation,  // Full object: { id, documentId }
                    tahun: String(formData.tahun || ''),  // FIXED: Database is now VARCHAR, send string
                    bonus: formData.bonus,
                    lainLain: formData.lainLain
                },

                // Payment Info (Component)
                paymentInfo: {
                    caraBayar: formData.caraBayar,
                    angsuran: Number(formData.angsuran) || 0,
                    tandaJadi: Number(formData.tandaJadi) || 0,
                    tenor: String(formData.tenor || ''),  // FIXED: Database is now VARCHAR, send string
                    namaLeasing: formData.namaLeasing,
                    dp: Number(formData.dp) || 0,
                    pembelianVia: formData.pembelianVia,
                    keterangan: formData.keterangan
                },

                // Media (Top-level Relations) - Use connect syntax
                ktpPaspor: ktpPasporConnect,
                kartuKeluarga: kartuKeluargaConnect,
                selfie: selfieConnect
            };

            // PRUNING: Empty Strings & Nulls
            // 1. Delete Null Relations (top-level)
            if (!payloadData.salesProfile) delete payloadData.salesProfile;
            if (!payloadData.ktpPaspor) delete payloadData.ktpPaspor;
            if (!payloadData.kartuKeluarga) delete payloadData.kartuKeluarga;
            if (!payloadData.selfie) delete payloadData.selfie;

            // 2. Delete Empty Strings for Optional/Unique Fields
            if (!payloadData.unitInfo.noMesin) delete payloadData.unitInfo.noMesin;
            if (!payloadData.unitInfo.noRangka) delete payloadData.unitInfo.noRangka;
            if (!payloadData.unitInfo.bonus) delete payloadData.unitInfo.bonus;
            if (!payloadData.unitInfo.lainLain) delete payloadData.unitInfo.lainLain;

            if (!payloadData.paymentInfo.namaLeasing) delete payloadData.paymentInfo.namaLeasing;
            if (!payloadData.paymentInfo.pembelianVia) delete payloadData.paymentInfo.pembelianVia;
            if (!payloadData.paymentInfo.keterangan) delete payloadData.paymentInfo.keterangan;

            // SAFETY CHECK: Ensure required relations are present after pruning
            if (!payloadData.unitInfo.vehicleType || !payloadData.unitInfo.vehicleType.id) {
                console.error("CRITICAL: vehicleType relation missing or invalid after pruning!");
                console.error("formData.vehicleType =", formData.vehicleType);
                console.error("vehicleTypeId =", vehicleTypeId);
                alert("Vehicle Type relation is missing. Please try selecting the vehicle again.");
                setLoading(false);
                return;
            }
            if (!payloadData.unitInfo.color || !payloadData.unitInfo.color.id) {
                console.error("CRITICAL: color relation missing or invalid after pruning!");
                console.error("formData.color =", formData.color);
                console.error("colorId =", colorId);
                alert("Color relation is missing. Please try selecting the color again.");
                setLoading(false);
                return;
            }

            const safePayload = { data: payloadData };

            if (editId) {
                await api.put(`/spks/${editId}`, safePayload);
                alert("SPK Updated Successfully!");
            } else {
                await api.post('/spks', safePayload);
                localStorage.removeItem('spk_draft');
                alert("SPK Created Successfully!");
            }
            navigate('/spk');
        } catch (error: any) {
            // Log error for debugging
            console.error("SPK Submission Error:", error.response?.data?.error || error.message);

            const status = error.response?.status;
            const data = error.response?.data;
            const errorMessage = data?.error?.message || data?.error || JSON.stringify(data || "Unknown error");

            alert(`Error ${status}: ${errorMessage}`);
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
                                        // Optional: Clear selected vehicle if it doesn't match the new group?
                                        // For now let's just let it stay, or user can change it.
                                        setFormData(prev => ({ ...prev, vehicleType: null })); // Reset type on group change to avoid mismatch
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Groups" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Groups</SelectItem>
                                        {vehicleGroups.map((g: any) => (
                                            <SelectItem key={g.id} value={g.id.toString()}>
                                                {g.attributes?.name || g.name}
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
                                        const id = Number(idStr);
                                        const vehicle = vehicleTypes.find((v: any) => v.id === id);
                                        if (vehicle) {
                                            setFormData(prev => ({ ...prev, vehicleType: id }));
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Vehicle">
                                            {formData.vehicleType ? vehicleTypes.find((v: any) => v.id === formData.vehicleType)?.attributes?.name || vehicleTypes.find((v: any) => v.id === formData.vehicleType)?.name : "Select Vehicle"}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(() => {
                                            const filtered = vehicleTypes
                                                .filter((v: any) => {
                                                    if (!selectedGroup || selectedGroup === "all") return true;

                                                    // Get the selected group name from vehicleGroups
                                                    const selectedGroupObj = vehicleGroups.find((g: any) => g.id.toString() === selectedGroup);
                                                    const selectedGroupName = selectedGroupObj?.name || selectedGroupObj?.attributes?.name;

                                                    // Get the vehicle's group name (direct string field, not a relation)
                                                    const vehicleGroupName = v.vehicle_group || v.attributes?.vehicle_group;

                                                    // Match by name
                                                    return vehicleGroupName === selectedGroupName;
                                                });

                                            return filtered;
                                        })()
                                            .map((v: any) => (
                                                <SelectItem key={v.id} value={v.id.toString()}>
                                                    {v.attributes?.name || v.name}
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
                                        const id = Number(idStr);
                                        const color = colors.find((c: any) => c.id === id);
                                        if (color) {
                                            setFormData(prev => ({ ...prev, color: id }));
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Color">
                                            {formData.color ? colors.find((c: any) => c.id === formData.color)?.attributes?.colorname || colors.find((c: any) => c.id === formData.color)?.colorname || colors.find((c: any) => c.id === formData.color)?.name : "Select Color"}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {colors.map((c: any) => (
                                            <SelectItem key={c.id} value={c.id.toString()}>
                                                {c.attributes?.colorname || c.colorname || c.name}
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
                                <Label>KTP Image {formData.ktpId && "✅"}</Label>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => setShowCamera({ isOpen: true, field: 'ktp' })}>Camera</Button>
                                    <Input type="file" className="hidden" id="ktp-upload" accept="image/*" onChange={e => handleMediaSelect(e, 'ktp')} />
                                    <Button variant="outline" onClick={() => document.getElementById('ktp-upload')?.click()}>Gallery</Button>
                                </div>
                                {formData.ktpUrl && <img src={getStrapiMedia(formData.ktpUrl) || ''} className="h-20 w-auto rounded border" />}
                            </div>

                            {/* KK */}
                            <div className="space-y-2">
                                <Label>KK Image {formData.kkId && "✅"}</Label>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => setShowCamera({ isOpen: true, field: 'kk' })}>Camera</Button>
                                    <Input type="file" className="hidden" id="kk-upload" accept="image/*" onChange={e => handleMediaSelect(e, 'kk')} />
                                    <Button variant="outline" onClick={() => document.getElementById('kk-upload')?.click()}>Gallery</Button>
                                </div>
                                {formData.kkUrl && <img src={getStrapiMedia(formData.kkUrl) || ''} className="h-20 w-auto rounded border" />}
                            </div>

                            {/* SELFIE */}
                            <div className="space-y-2">
                                <Label>Selfie with Customer {formData.selfieId && "✅"}</Label>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => setShowCamera({ isOpen: true, field: 'selfie' })}>Camera</Button>
                                    <Input type="file" className="hidden" id="selfie-upload" accept="image/*" onChange={e => handleMediaSelect(e, 'selfie')} />
                                    <Button variant="outline" onClick={() => document.getElementById('selfie-upload')?.click()}>Gallery</Button>
                                </div>
                                {formData.selfieUrl && <img src={getStrapiMedia(formData.selfieUrl) || ''} className="h-20 w-auto rounded border" />}
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
                        if (showCamera.field) uploadFileToStrapi(file, showCamera.field as any);
                    }}
                    onClose={() => setShowCamera({ isOpen: false, field: null })}
                />
            )}
        </div>
    );
}
