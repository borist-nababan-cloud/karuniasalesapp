import { SupabaseClient } from '@supabase/supabase-js';

export const fetchLatestArticles = async (supabase: SupabaseClient, limit: number = 2) => {
    try {
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);
        
        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error("Failed to fetch articles:", err);
        throw err;
    }
};
