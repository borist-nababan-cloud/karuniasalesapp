import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';

export const useProfileSync = () => {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const isApproved = useAuthStore((state) => state.isApproved);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!user?.id) return;

        const syncProfile = async () => {
            try {
                const { data: profile, error } = await supabase
                    .from('user_profiles')
                    .select('blocked, confirmed')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;

                if (profile) {
                    // 1. Check Blocked Status
                    if (profile.blocked) {
                        alert("Session Terminated: You have been blocked by admin.");
                        logout();
                        navigate('/auth/login');
                        return;
                    }

                    // 2. Check & Update Approval Status
                    const newIsApproved = profile.confirmed === true;

                    // Only update if changed to avoid loops
                    if (newIsApproved !== isApproved) {
                        useAuthStore.getState().setApproved(newIsApproved);

                        if (newIsApproved && location.pathname === '/profile') {
                            // Optional: Auto-redirect if they were waiting
                            // navigate('/dashboard'); 
                        }
                    }
                }
            } catch (error: any) {
                console.error("Profile Sync Failed:", error);
            }
        };

        syncProfile();
    }, [user?.id, location.pathname]);
};
