import { z } from 'zod';

export const loginSchema = z.object({
    identifier: z.string().email({ message: "Format email tidak valid" }),
    password: z.string().min(6, { message: "Password minimal 6 karakter" }),
});

export const spkFormSchema = z.object({
    customer_name: z.string().min(1, { message: "Nama Customer wajib diisi" }),
    vehicle_type_id: z.string().min(1, { message: "Tipe kendaraan wajib dipilih" }),
    price: z.number().min(1, { message: "Harga kendaraan tidak valid" }),
    color_id: z.string().min(1, { message: "Warna kendaraan wajib dipilih" }).optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SpkFormData = z.infer<typeof spkFormSchema>;
