export interface SPKData {
    id?: string;
    customer_name: string;
    vehicle_type_id: string;
    price: number;
}

export interface AttendanceParams {
    userLat: number;
    userLng: number;
    branchLat: number;
    branchLng: number;
}