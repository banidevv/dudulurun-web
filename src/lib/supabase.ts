import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with service role key for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Upload file to Supabase Storage
export async function uploadToSupabase(
    file: Buffer,
    fileName: string,
    bucket: string = 'race-packs'
): Promise<{ url: string; path: string }> {
    try {
        // Upload file to Supabase Storage
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(fileName, file, {
                contentType: `image/${fileName.split('.').pop()}`,
                upsert: false // Don't overwrite existing files
            });

        if (error) {
            throw new Error(`Supabase upload error: ${error.message}`);
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);

        return {
            url: urlData.publicUrl,
            path: data.path
        };
    } catch (error) {
        console.error('Error uploading to Supabase:', error);
        throw error;
    }
}

// Delete file from Supabase Storage
export async function deleteFromSupabase(
    fileName: string,
    bucket: string = 'race-packs'
): Promise<void> {
    try {
        const { error } = await supabase.storage
            .from(bucket)
            .remove([fileName]);

        if (error) {
            throw new Error(`Supabase delete error: ${error.message}`);
        }
    } catch (error) {
        console.error('Error deleting from Supabase:', error);
        throw error;
    }
}
