import { supabase } from './supabase';
import type {
  AdminAction,
  AdminUserRow,
  Application,
  Booking,
  BookingStatus,
  BookingWithService,
  DocumentType,
  DocumentWithApplication,
  Guide,
  GuideCategory,
  NotificationRow,
  Profile,
  Provider,
  ProviderBooking,
  ProviderStatus,
  Review,
  Service,
  Testimonial,
  TestimonialStatus,
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

// --- bookings (US-17) ------------------------------------------------------

export async function listBookings(userId: string): Promise<BookingWithService[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, services ( name, provider, price, category ), reviews ( id, rating )')
    .eq('user_id', userId)
    .order('scheduled_for', { ascending: false });
  return unwrap(data, error) ?? [];
}

export async function createBooking(
  userId: string,
  input: { service_id: string; scheduled_for: string; notes?: string | null },
): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .insert({ ...input, user_id: userId })
    .select()
    .single();
  return unwrap(data, error);
}

export async function cancelBooking(bookingId: string): Promise<void> {
  const { error } = await supabase.rpc('cancel_booking', { p_booking: bookingId });
  if (error) throw new Error(error.message);
}

/** Provider or administrator moving a booking forward. */
export async function setBookingStatus(
  bookingId: string,
  status: BookingStatus,
): Promise<void> {
  const { error } = await supabase.rpc('set_booking_status', {
    p_booking: bookingId,
    p_status: status,
  });
  if (error) throw new Error(error.message);
}

// --- notifications (US-18) -------------------------------------------------

export async function listNotifications(userId: string): Promise<NotificationRow[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);
  return unwrap(data, error) ?? [];
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null);
  if (error) throw new Error(error.message);
}

// --- provider registration (US-19) -----------------------------------------

export async function getMyProvider(userId: string): Promise<Provider | null> {
  const { data, error } = await supabase
    .from('providers')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  return unwrap(data, error);
}

/** Accreditation documents go into the same private bucket, under the owner's folder. */
export async function uploadAccreditation(userId: string, file: File): Promise<string> {
  const safeName = file.name.replace(/[^\w.\-]+/g, '_');
  const path = `${userId}/accreditation-${Date.now()}-${safeName}`;
  const { error } = await supabase.storage
    .from('documents')
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  return path;
}

type ProviderDraft = Pick<
  Provider,
  | 'business_name'
  | 'registration_number'
  | 'contact_email'
  | 'contact_phone'
  | 'category'
  | 'description'
  | 'location'
  | 'accreditation_path'
>;

export async function registerProvider(
  userId: string,
  input: ProviderDraft,
): Promise<Provider> {
  const { data, error } = await supabase
    .from('providers')
    .insert({ ...input, user_id: userId })
    .select()
    .single();
  return unwrap(data, error);
}

// --- reviews (US-22) -------------------------------------------------------

export async function listReviewsForService(serviceId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('service_id', serviceId)
    .eq('removed', false)
    .order('created_at', { ascending: false });
  return unwrap(data, error) ?? [];
}

export async function createReview(
  userId: string,
  input: { booking_id: string; service_id: string; rating: number; comment?: string | null },
): Promise<Review> {
  const { data, error } = await supabase
    .from('reviews')
    .insert({ ...input, user_id: userId })
    .select()
    .single();
  return unwrap(data, error);
}

// --- testimonials (US-23) --------------------------------------------------

/** Readable without signing in: these appear on the landing page. */
export async function listApprovedTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('status', 'approved')
    .order('approved_at', { ascending: false })
    .limit(12);
  return unwrap(data, error) ?? [];
}

export async function submitTestimonial(
  userId: string,
  input: { quote: string; display_name?: string | null; name_consent: boolean },
): Promise<Testimonial> {
  const { data, error } = await supabase
    .from('testimonials')
    .insert({ ...input, user_id: userId })
    .select()
    .single();
  return unwrap(data, error);
}

// --- educational content (US-25) -------------------------------------------

export async function listGuides(
  language: string,
  category?: GuideCategory | 'all',
): Promise<Guide[]> {
  let q = supabase.from('guides').select('*').eq('published', true);
  if (category && category !== 'all') q = q.eq('category', category);
  const { data, error } = await q.order('category');
  const all: Guide[] = unwrap(data, error) ?? [];
  // Prefer the reader's language, falling back to English where no translation exists.
  const inLang = all.filter((g) => g.language === language);
  const slugs = new Set(inLang.map((g) => g.slug));
  return [...inLang, ...all.filter((g) => g.language === 'en' && !slugs.has(g.slug))];
}

export async function getGuide(slug: string, language: string): Promise<Guide | null> {
  const { data, error } = await supabase
    .from('guides')
    .select('*')
    .eq('slug', slug)
    .in('language', [language, 'en'])
    .eq('published', true);
  const rows: Guide[] = unwrap(data, error) ?? [];
  return rows.find((g) => g.language === language) ?? rows[0] ?? null;
}

// --- administration (US-21) ------------------------------------------------

export async function adminSearchUsers(query = ''): Promise<AdminUserRow[]> {
  const { data, error } = await supabase.rpc('admin_search_users', { p_query: query });
  return unwrap(data, error) ?? [];
}

export async function adminSetSuspended(
  userId: string,
  suspended: boolean,
  reason?: string | null,
): Promise<void> {
  const { error } = await supabase.rpc('admin_set_suspended', {
    p_user: userId,
    p_suspended: suspended,
    p_reason: reason ?? null,
  });
  if (error) throw new Error(error.message);
}

export async function adminListProviders(): Promise<Provider[]> {
  const { data, error } = await supabase.rpc('admin_pending_providers');
  return unwrap(data, error) ?? [];
}

export async function adminSetProviderStatus(
  providerId: string,
  status: ProviderStatus,
  reason?: string | null,
): Promise<void> {
  const { error } = await supabase.rpc('admin_set_provider_status', {
    p_provider: providerId,
    p_status: status,
    p_reason: reason ?? null,
  });
  if (error) throw new Error(error.message);
}

export async function adminListTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase.rpc('admin_all_testimonials');
  return unwrap(data, error) ?? [];
}

export async function adminSetTestimonialStatus(
  id: string,
  status: TestimonialStatus,
): Promise<void> {
  const { error } = await supabase.rpc('admin_set_testimonial_status', {
    p_id: id,
    p_status: status,
  });
  if (error) throw new Error(error.message);
}

export async function adminRemoveReview(id: string, reason: string): Promise<void> {
  const { error } = await supabase.rpc('admin_remove_review', { p_id: id, p_reason: reason });
  if (error) throw new Error(error.message);
}

export async function adminListActions(): Promise<AdminAction[]> {
  const { data, error } = await supabase
    .from('admin_actions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  return unwrap(data, error) ?? [];
}

// --- provider: own services and bookings -----------------------------------

export async function listMyServices(providerId: string): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false });
  return unwrap(data, error) ?? [];
}

/**
 * Rating, review count, featured and the verified shield are not sent: they
 * describe the provider rather than belong to it, and the database refuses
 * them from this role. The display name is filled in by a trigger.
 */
export async function createService(
  providerId: string,
  input: {
    name: string;
    category: Service['category'];
    description: string | null;
    price: string | null;
    location: string | null;
    delivery_time: string | null;
  },
): Promise<Service> {
  const { data, error } = await supabase
    .from('services')
    .insert({ ...input, provider_id: providerId, is_active: true })
    .select()
    .single();
  return unwrap(data, error);
}

/** Services with bookings cannot be deleted, so listings are switched off instead. */
export async function setServiceActive(id: string, active: boolean): Promise<void> {
  const { error } = await supabase.from('services').update({ is_active: active }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function listProviderBookings(providerId: string): Promise<ProviderBooking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, services!inner ( name, provider_id )')
    .eq('services.provider_id', providerId)
    .order('scheduled_for', { ascending: true });
  return unwrap(data, error) ?? [];
}
