import { supabase } from './supabase';

export function getSupabaseMedia(path: string | null, bucket: string = 'spk-documents') {
  if (!path) return null;
  
  // If it's already a full URL, return it
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Generate public URL from specified bucket
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};
