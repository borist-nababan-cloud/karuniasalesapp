import { z } from 'zod';

export const SpkSchema = z.object({
    customer_name: z.string().min(3),
    vehicle_type_id: z.string().min(1, "Vehicle Type is required"),
    price: z.number().positive(),
});

export const formatCurrency = (amount: number | string) => {
    if (!amount) return 'Rp. 0';
    const formatted = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(Number(amount));
    return `Rp. ${formatted}`;
};

export const formatTenor = (tenor: string | number) => {
    if (!tenor) return '-';
    const t = Number(tenor);
    if (isNaN(t)) return `${tenor} Bulan`;
    const tahun = Math.floor(t / 12);
    const bulan = t % 12;
    if (tahun > 0 && bulan > 0) return `${tahun} Tahun ${bulan} Bulan`;
    if (tahun > 0) return `${tahun} Tahun`;
    return `${bulan} Bulan`;
};

export const parseSpkDataForPdf = (item: any) => {
    if (!item) return null;
    return {
        id: item.id,
        noSPK: item.no_spk,
        tanggal: item.tanggal,
        pekerjaanCustomer: item.pekerjaan_customer,
        namaCustomer: item.nama_customer,
        namaDebitur: item.nama_debitur,
        emailcustomer: item.email_customer,
        alamatCustomer: item.alamat_customer,
        noTeleponCustomer: item.no_telepon_customer,
        kotacustomer: item.kota_customer,
        editable: item.editable,
        finish: item.finish,
        branch_id: item.branch_id,
        ktpPaspor: item.ktp_url ? { url: item.ktp_url } : null,
        kartuKeluarga: item.kk_url ? { url: item.kk_url } : null,
        selfie: item.selfie_url ? { url: item.selfie_url } : null,
        salesProfile: item.salesProfile ? {
            id: item.salesProfile.id,
            surename: item.salesProfile.full_name || item.salesProfile.username || '-',
            namasupervisor: item.salesProfile.supervisor ? (Array.isArray(item.salesProfile.supervisor) ? item.salesProfile.supervisor[0]?.namasupervisor : item.salesProfile.supervisor.namasupervisor) || '-' : '-',
            email: item.salesProfile.email || '-',
            phonenumber: item.salesProfile.phone || '-',
            city: '-',
            address: '-',
        } : null,
        branch: item.branch || null,
        detailInfo: (() => {
            const d = Array.isArray(item.spk_section_details) ? item.spk_section_details[0] : item.spk_section_details || (Array.isArray(item.detailInfo) ? item.detailInfo[0] : item.detailInfo);
            return d ? {
                namaBpkbStnk: d.nama_bpkb_stnk,
                kotaStnkBpkb: d.kota_stnk_bpkb,
                alamatBpkbStnk: d.alamat_bpkb_stnk,
            } : null;
        })(),
        unitInfo: (() => {
            const u = Array.isArray(item.spk_section_units) ? item.spk_section_units[0] : item.spk_section_units || (Array.isArray(item.unitInfo) ? item.unitInfo[0] : item.unitInfo);
            return u ? {
                noRangka: u.no_rangka,
                noMesin: u.no_mesin,
                tahun: u.tahun,
                hargaOtr: u.harga_otr,
                vehicleType: u.vehicle_types || u.vehicleType,
                color: u.colors || u.color,
                bonus: u.bonus,
                lainLain: u.lain_lain,
            } : null;
        })(),
        paymentInfo: (() => {
            const p = Array.isArray(item.spk_section_payments) ? item.spk_section_payments[0] : item.spk_section_payments || (Array.isArray(item.paymentInfo) ? item.paymentInfo[0] : item.paymentInfo);
            return p ? {
                caraBayar: p.cara_bayar,
                angsuran: p.angsuran,
                tandaJadi: p.tanda_jadi,
                dp: p.dp,
                namaLeasing: p.nama_leasing,
                pembelianVia: p.pembelian_via,
                tenor: p.tenor,
                keterangan: p.keterangan,
            } : null;
        })(),
        createdAt: item.created_at,
        updatedAt: item.updated_at,
    };
};