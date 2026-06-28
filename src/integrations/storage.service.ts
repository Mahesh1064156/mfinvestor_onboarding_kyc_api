import { supabase } from '../config/supabase';
import { env } from '../config/env';
import { ApiError } from '../common/utils/apiError';

export const uploadToSupabase = async (file: Express.Multer.File, path: string) => {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) throw new ApiError(500, 'Supabase credentials are not configured', 'STORAGE_CONFIG_ERROR');

  const { error } = await supabase.storage.from(env.supabaseBucket).upload(path, file.buffer, {
    contentType: file.mimetype,
    upsert: true,
  });

  if (error) throw new ApiError(500, error.message, 'STORAGE_ERROR');

  const { data } = supabase.storage.from(env.supabaseBucket).getPublicUrl(path);
  return { fileUrl: data.publicUrl, storagePath: path };
};
