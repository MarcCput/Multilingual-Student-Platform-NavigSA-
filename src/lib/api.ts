import { supabase } from './supabase';
import type {
  Application,
  DocumentType,
  DocumentWithApplication,
  Profile,
  Service,
} from './database.types';

/** Throws with Supabase's message so callers can surface it in the UI. */
function unwrap<T>(data: T | null, error: { message: string } | null): T {
  if (error) throw new Error(error.message);
  return data as T;
}

// --- profile ---------------------------------------------------------------

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  return unwrap(data, error);
}

export async function updateProfile(
  userId: string,
  patch: Partial<Profile>,
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select()
    .single();
  return unwrap(data, error);
}

// --- applications ----------------------------------------------------------

export async function listApplications(userId: string): Promise<Application[]> {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return unwrap(data, error) ?? [];
}

export async function createApplication(
  userId: string,
  input: Pick<Application, 'university' | 'program'> & Partial<Application>,
): Promise<Application> {
  const { data, error } = await supabase
    .from('applications')
    .insert({ ...input, user_id: userId })
    .select()
    .single();
  return unwrap(data, error);
}

export async function deleteApplication(id: string): Promise<void> {
  const { error } = await supabase.from('applications').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// --- documents -------------------------------------------------------------

export async function listDocuments(
  userId: string,
): Promise<DocumentWithApplication[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*, applications ( university )')
    .eq('user_id', userId)
    .order('uploaded_at', { ascending: false });
  return unwrap(data, error) ?? [];
}

/**
 * Uploads the file to the private `documents` bucket under <user-id>/, then
 * records a row pointing at it. If the metadata insert fails we remove the
 * orphaned object so storage and the table can't drift apart.
 */
export async function uploadDocument(
  userId: string,
  file: File,
  meta: { type: DocumentType; applicationId?: string | null },
): Promise<DocumentWithApplication> {
  const safeName = file.name.replace(/[^\w.\-]+/g, '_');
  const storagePath = `${userId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(storagePath, file, { contentType: file.type, upsert: false });
  if (uploadError) throw new Error(uploadError.message);

  const { data, error } = await supabase
    .from('documents')
    .insert({
      user_id: userId,
      application_id: meta.applicationId ?? null,
      name: file.name,
      type: meta.type,
      storage_path: storagePath,
      size_bytes: file.size,
      mime_type: file.type,
    })
    .select('*, applications ( university )')
    .single();

  if (error) {
    await supabase.storage.from('documents').remove([storagePath]);
    throw new Error(error.message);
  }
  return data as DocumentWithApplication;
}

/** Short-lived signed URL — the bucket is private, so there is no public link. */
export async function getDocumentUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(storagePath, 60);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

export async function deleteDocument(
  id: string,
  storagePath: string,
): Promise<void> {
  const { error } = await supabase.from('documents').delete().eq('id', id);
  if (error) throw new Error(error.message);
  // Row is gone; a leftover object is harmless but we clean it up anyway.
  await supabase.storage.from('documents').remove([storagePath]);
}

// --- services --------------------------------------------------------------

export async function listServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('featured', { ascending: false })
    .order('rating', { ascending: false });
  return unwrap(data, error) ?? [];
}

// --- display helpers -------------------------------------------------------

export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return '0 KB';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
