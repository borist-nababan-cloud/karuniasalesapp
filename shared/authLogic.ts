import type { SupabaseClient } from '@supabase/supabase-js';

export const registerSalesUser = async (
    supabase: SupabaseClient, 
    email: string, 
    password: string, 
    username: string
) => {
    // 1. Register with Supabase Auth
    // The database trigger 'handle_new_user' will read raw_user_meta_data 
    // and automatically insert into user_profiles with the correct role_id

    const signUpOptions = {
        email,
        password,
        options: {
            data: {
                username,
                full_name: username,
                role_id: 3, // Sales App specifies role_id: 3
            }
        }
    };
    
    const { data: authData, error: authError } = await supabase.auth.signUp(signUpOptions);

    if (authError) {
        console.error("[authLogic] Supabase Auth Error:", authError);
        throw authError;
    }

    const user = authData.user;
    const session = authData.session;
    
    if (!user) throw new Error("Registration failed to return user");

    // 2. Immediately sign out if a session was created (requires admin approval)
    if (session) {
        await supabase.auth.signOut();
    }

    return authData;
};

export const checkMandatoryReset = async (
    supabase: SupabaseClient<any, "public", any>,
    userId: string
): Promise<boolean> => {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('force_password_reset')
        .eq('id', userId)
        .single();

    if (error || !data) {
        console.error('Error fetching user profile reset flag:', error);
        return false;
    }
    return !!data.force_password_reset;
};

export const executeMandatoryReset = async (
    supabase: SupabaseClient<any, "public", any>,
    userId: string,
    newPassword: string
): Promise<{ success: boolean; error?: string }> => {
    // 1. Update Password in Auth
    const { error: authError } = await supabase.auth.updateUser({
        password: newPassword,
    });

    if (authError) {
        console.error('Error updating auth password:', authError);
        return { success: false, error: authError.message };
    }

    // 2. Clear force_password_reset flag
    const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ force_password_reset: false })
        .eq('id', userId)

    if (profileError) {
        console.error('Error clearing reset flag:', profileError);
        return { success: false, error: profileError.message };
    }

    return { success: true };
};