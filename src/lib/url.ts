import { supabase } from './supabase';

export function getSupabaseMedia(path: string | null) {
  if (!path) return null;
  
  // If it's already a full URL, return it
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Generate public URL from 'spk-documents' bucket
  const { data } = supabase.storage.from('spk-documents').getPublicUrl(path);
  return data.publicUrl;
};
