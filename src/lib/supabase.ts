import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL?.trim().replace(/^['"]|['"]$/g, '');
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim().replace(/^['"]|['"]$/g, '');

// Clean up the URL (strip trailing slashes or /rest/v1/ suffixes)
const supabaseUrl = rawUrl?.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const supabaseAnonKey = rawKey;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_url' &&
  !supabaseUrl.includes('placeholder')
);

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://abcdefghijklm.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder'
);

export async function uploadImage(file: File, folder: string = 'general') {
  if (!isSupabaseConfigured) {
    console.warn("Supabase is not configured. Returning local browser Object URL as fallback.");
    try {
      const bUrl = URL.createObjectURL(file);
      return bUrl + '#' + encodeURIComponent(file.name);
    } catch (e) {
      return "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80";
    }
  }

  try {
    const fileExt = file.name.split('.').pop() || '';
    const originalNameWithNoExt = file.name.includes('.') 
      ? file.name.substring(0, file.name.lastIndexOf('.')) 
      : file.name;
      
    // Sanitize name: keep lowercase, numbers, hyphens, and underscores. Put "_" instead of spaces or special characters.
    const sanitizedBase = originalNameWithNoExt
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_')
      .replace(/__+/g, '_')
      .substring(0, 100); // prevent excessively long filenames
  
    // Add random short component to avoid name collisions path
    const uniqueId = Math.random().toString(36).substring(2, 9);
    const fileName = `${sanitizedBase}_${uniqueId}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;
  
    const { error: uploadError } = await supabase.storage
      .from('assets')
      .upload(filePath, file);
  
    if (uploadError) {
      console.warn("Supabase storage upload failed, falling back to local Object URL:", uploadError);
      try {
        const bUrl = URL.createObjectURL(file);
        return bUrl + '#' + encodeURIComponent(file.name);
      } catch (e) {
        throw uploadError;
      }
    }
  
    const { data: { publicUrl } } = supabase.storage
      .from('assets')
      .getPublicUrl(filePath);
  
    return publicUrl;
  } catch (err) {
    console.warn("Supabase upload exception caught, falling back to local Object URL:", err);
    try {
      return URL.createObjectURL(file);
    } catch (e) {
      throw err;
    }
  }
}

export type Project = {
  id: string;
  title: string;
  client_name: string;
  location: string;
  completed_at: string;
  system_size: string;
  panel_specs: string;
  inverter_type: string;
  estimated_savings: string;
  image_url: string;
  thumbnails: string[];
  overview_content: string;
  technical_content: string;
  status?: string;
  personnel?: {
    engineer?: { name: string; title: string; avatar: string };
    installer?: { name: string; title: string; avatar: string };
    members?: { name: string; title: string }[];
  };
  is_deleted: boolean;
  created_at: string;
  category?: string;
};

export type BlogPost = {
  id: string;
  title: string;
  author_name: string;
  author_role: string;
  author_avatar: string;
  content: string;
  image_url: string;
  category: string;
  read_time: string;
  is_deleted: boolean;
  created_at: string;
  views: number;
};

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  property_type: string;
  utility_provider?: string;
  monthly_bill?: string;
  roof_type?: string;
  shading?: string;
  goal?: string;
  timeline?: string;
  bill_url?: string | null;
  status: 'New' | 'Contacted' | 'In Progress' | 'Archived';
  created_at: string;
  ocular_visit_date?: string;
  has_inverter_location?: string;
  inverter_distance?: string;
  panel_board_location?: string;
  inverter_location?: string;
};

export type Subscriber = {
  id: string;
  email: string;
  source: string;
  created_at: string;
};

export type Testimonial = {
  id: string;
  client_name: string;
  location: string;
  rating: number;
  content: string;
  avatar_url: string;
  project_type: string;
  created_at: string;
};

/**
 * Safely executes a Supabase query builder.
 * If the main query fails with "column does not exist" (code 42703 or PGRST204),
 * it falls back to the secondary query and filters the array client-side (if applicable).
 */
export async function safeDbQuery<T = any>(
  mainQueryFn: () => any,
  fallbackQueryFn: () => any
): Promise<any> {
  try {
    const result = await mainQueryFn();
    if (result.error && (result.error.code === '42703' || result.error.code === 'PGRST204')) {
      const fallbackResult = await fallbackQueryFn();
      if (!fallbackResult.error) {
        if (fallbackResult.data && Array.isArray(fallbackResult.data)) {
          const filtered = fallbackResult.data.filter((item: any) => item.is_deleted !== true);
          return { data: filtered, error: null, count: fallbackResult.count };
        }
        return fallbackResult;
      }
      return fallbackResult;
    }
    return result;
  } catch (err) {
    console.error(`Exception in safeDbQuery:`, err);
    return await fallbackQueryFn();
  }
}

/**
 * Safely updates a record. If the table doesn't have the specified update columns
 * (e.g. is_deleted fails with error 42703 or PGRST204), it falls back to alternative columns.
 */
export async function safeDbUpdate<T>(
  tableName: string,
  id: string,
  updates: Record<string, any>,
  fallbackUpdates?: Record<string, any>
): Promise<{ data: T[] | null; error: any }> {
  try {
    const query = supabase.from(tableName).update(updates).eq('id', id);
    const { data, error } = await (query.select ? query.select() : query);
    
    if (error && (error.code === '42703' || error.code === 'PGRST204') && fallbackUpdates) {
      const fallbackQuery = supabase.from(tableName).update(fallbackUpdates).eq('id', id);
      return await (fallbackQuery.select ? fallbackQuery.select() : fallbackQuery);
    }
    return { data: data as T[] | null, error };
  } catch (err) {
    console.error(`Exception in safeDbUpdate:`, err);
    if (fallbackUpdates) {
      const fallbackQuery = supabase.from(tableName).update(fallbackUpdates).eq('id', id);
      return await (fallbackQuery.select ? fallbackQuery.select() : fallbackQuery);
    }
    return { data: null, error: err as any };
  }
}

/**
 * Safely soft-deletes or hard-deletes a record if the soft-delete column (like is_deleted)
 * doesn't exist on the table.
 */
export async function safeDbDelete(
  tableName: string,
  id: string,
  fallbackToHardDelete: boolean = true
): Promise<{ error: any }> {
  try {
    const { error } = await supabase.from(tableName).update({ is_deleted: true }).eq('id', id);
    if (error && (error.code === '42703' || error.code === 'PGRST204') && fallbackToHardDelete) {
      return await supabase.from(tableName).delete().eq('id', id);
    }
    return { error };
  } catch (err) {
    console.error(`Exception in safeDbDelete:`, err);
    return { error: err };
  }
}

/**
 * Safely soft-deletes or hard-deletes multiple records by ID.
 */
export async function safeDbBulkDelete(
  tableName: string,
  ids: string[],
  fallbackToHardDelete: boolean = true
): Promise<{ error: any }> {
  try {
    const { error } = await supabase.from(tableName).update({ is_deleted: true }).in('id', ids);
    if (error && (error.code === '42703' || error.code === 'PGRST204') && fallbackToHardDelete) {
      return await supabase.from(tableName).delete().in('id', ids);
    }
    return { error };
  } catch (err) {
    console.error(`Exception in safeDbBulkDelete:`, err);
    return { error: err };
  }
}


