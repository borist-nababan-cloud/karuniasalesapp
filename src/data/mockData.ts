export const MOCK_DATA = {
    users: [
        { id: 1, username: "sales_demo", email: "sales@dealer.com", role: "SALES", branch_id: 1, uid: "user_123_abc" }
    ],
    branches: [
        { id: 1, name: "Jakarta Headquarters", latitude: -6.175392, longitude: 106.827153, radius_meters: 500 }
    ],
    vehicle_groups: [
        { id: 1, name: "MPV (Family)", code: "MPV" },
        { id: 2, name: "SUV (Sport)", code: "SUV" },
        { id: 3, name: "LCGC (Eco)", code: "LCGC" }
    ],
    vehicle_types: [
        { id: 11, group_id: 1, name: "Daihatsu Xenia" },
        { id: 12, group_id: 1, name: "Daihatsu Luxio" },
        { id: 21, group_id: 2, name: "Daihatsu Terios" },
        { id: 22, group_id: 2, name: "Daihatsu Rocky" },
        { id: 31, group_id: 3, name: "Daihatsu Sigra" },
        { id: 32, group_id: 3, name: "Daihatsu Ayla" }
    ]
};
