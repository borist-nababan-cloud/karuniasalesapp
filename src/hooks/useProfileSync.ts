import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/axios';
import { useNavigate, useLocation } from 'react-router-dom';

export const useProfileSync = () => {
    const { user, logout, isApproved } = useAuthStore((state) => state);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!user?.email) return;

        const syncProfile = async () => {
            try {
                const response = await api.get('/sales-profiles', {
                    params: {
                        filters: { email: { $eq: user.email } }
                    }
                });

                if (response.data?.data?.length > 0) {
                    const profileData = response.data.data[0];
                    const profile = profileData.attributes ? { ...profileData.attributes, id: profileData.id } : profileData;

                    // 1. Check Blocked Status
                    if (profile.blocked) {
                        alert("Session Terminated: You have been blocked by admin.");
                        logout();
                        navigate('/auth/login');
                        return;
                    }

                    // 2. Check & Update Approval Status
                    const rawApproved = profile.approved;
                    const newIsApproved = rawApproved === true || rawApproved === 'true' || rawApproved === 1 || rawApproved === '1';

                    // Only update if changed to avoid loops
                    if (newIsApproved !== isApproved) {

                        // We need to update the store WITHOUT breaking the token/user
                        // Re-using login method or adding a setApproved method would be cleaner
                        // access store directly via hook
                        useAuthStore.getState().setApproved(newIsApproved);

                        // If newly approved and currently on profile, offer redirect?
                        // Or simply let the UI unlock.
                        if (newIsApproved && location.pathname === '/profile') {
                            // Optional: Auto-redirect if they were waiting
                            // navigate('/dashboard'); 
                        }
                    }
                }
            } catch (error: any) {
                console.error("Profile Sync Failed:", error);

                // If 403 Forbidden, it means the role/token is invalid for fetching profile.
                // Force logout to prevent inconsistent state.
                if (error.response?.status === 403) {
                    alert("Session Expired or Permission Denied. Please login again.");
                    logout();
                    navigate('/auth/login');
                }
            }
        };

        syncProfile();
    }, [user?.email, location.pathname]); // Re-check on route change or just mount? Route change is safer for "Blocked" check.
};
