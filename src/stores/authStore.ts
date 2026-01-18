import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: number;
    username: string;
    email: string;
    role?: string;
    uid?: string; // Firebase style mock
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isApproved: boolean; // New: Sales Profile Status
    login: (user: User, token: string, isApproved?: boolean) => void;
    logout: () => void;
    setApproved: (status: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isApproved: false,
            login: (user, token, isApproved = false) => set({
                user,
                token,
                isAuthenticated: true,
                isApproved
            }),
            logout: () => set({
                user: null,
                token: null,
                isAuthenticated: false,
                isApproved: false
            }),
            setApproved: (status) => set({ isApproved: status }),
        }),
        {
            name: 'auth-storage',
        }
    )
);
