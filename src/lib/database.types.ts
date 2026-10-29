/**
 * Shapes of the tables created by supabase/migrations.
 * Keep this in sync by hand, or regenerate with:
 *   npx supabase gen types typescript --project-id <ref> > src/lib/database.types.ts
 */

export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type ApplicationStatus = 'pending' | 'in-progress' | 'completed';
export type DocumentStatus = 'pending' | 'verified' | 'rejected';
export type DocumentType =
  | 'Identity'
  | 'Academic'
  | 'Language'
  | 'Application'
  | 'Financial'
  | 'Other';
export type ServiceCategory =
  | 'translation'
  | 'visa'
  | 'accommodation'
  | 'tutoring'
  | 'legal';

export type UserRole = 'student' | 'provider' | 'admin';

export interface NotificationPrefs {
  application_updates: boolean;
  document_verification: boolean;
  new_messages: boolean;
  deadline_reminders: boolean;
}

export interface Profile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  country_of_origin: string | null;
  preferred_language: 'en' | 'pt' | 'fr' | 'es';
  field_of_study: string | null;
  intended_start_year: number | null;
  preferred_universities: string[];
  id_document_type: string | null;
  id_document_number: string | null;
  verification_status: VerificationStatus;
  verified_at: string | null;
  onboarding_completed: boolean;
  notification_prefs: NotificationPrefs;
  role: UserRole;
  suspended: boolean;
  suspended_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  user_id: string;
  university: string;
  program: string;
  status: ApplicationStatus;
  progress: number;
  deadline: string | null;
  submitted_date: string | null;
  requirements_total: number;
  requirements_completed: number;
  next_step: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentRow {
  id: string;
  user_id: string;
  application_id: string | null;
  name: string;
  type: DocumentType;
  storage_path: string;
  size_bytes: number;
  mime_type: string | null;
  status: DocumentStatus;
  rejection_reason: string | null;
  uploaded_at: string;
}

/** A document joined to the application it belongs to, as the UI renders it. */
export interface DocumentWithApplication extends DocumentRow {
  applications: { university: string } | null;
}

export interface Service {
  id: string;
  name: string;
  provider: string;
  category: ServiceCategory;
  description: string | null;
  rating: number;
  reviews: number;
  price: string | null;
  location: string | null;
  delivery_time: string | null;
  verified: boolean;
  featured: boolean;
  created_at: string;
  provider_id: string | null;
  is_active: boolean;
}

// --- added for US-17, 18, 19, 21, 22, 23, 25 -------------------------------

export type ProviderStatus = 'pending' | 'verified' | 'rejected';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type TestimonialStatus = 'pending' | 'approved' | 'rejected';
export type GuideCategory = 'saqa' | 'visa' | 'university' | 'accommodation';
export type NotificationType =
  | 'application_status'
  | 'booking'
  | 'deadline_reminder'
  | 'provider_status'
  | 'document_status'
  | 'system';

export interface Provider {
  id: string;
  user_id: string;
  business_name: string;
  registration_number: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  category: ServiceCategory;
  description: string | null;
  location: string | null;
  accreditation_path: string | null;
  status: ProviderStatus;
  rejection_reason: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  service_id: string;
  scheduled_for: string;
  status: BookingStatus;
  notes: string | null;
  reference: string;
  created_at: string;
  updated_at: string;
}

/** A booking joined to the service it is for, as the UI renders it. */
export interface BookingWithService extends Booking {
  services: Pick<Service, 'name' | 'provider' | 'price' | 'category'> | null;
  reviews: { id: string; rating: number }[] | null;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  booking_id: string;
  service_id: string;
  rating: number;
  comment: string | null;
  removed: boolean;
  removed_reason: string | null;
  created_at: string;
}

export interface Testimonial {
  id: string;
  user_id: string | null;
  quote: string;
  display_name: string | null;
  name_consent: boolean;
  status: TestimonialStatus;
  created_at: string;
  approved_at: string | null;
}

export interface Guide {
  id: string;
  slug: string;
  language: 'en' | 'fr' | 'pt';
  category: GuideCategory;
  title: string;
  summary: string | null;
  body: string;
  sources: { label: string; url: string }[];
  published: boolean;
  created_at: string;
}

/** Row shape returned by the admin_search_users function. */
export interface AdminUserRow {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  suspended: boolean;
  verification_status: VerificationStatus;
  created_at: string;
  provider_status: ProviderStatus | null;
  provider_business: string | null;
}

export interface AdminAction {
  id: string;
  admin_id: string;
  action: string;
  target_table: string | null;
  target_id: string | null;
  detail: Record<string, unknown>;
  created_at: string;
}

/** A booking as a provider sees it: the service it is for, no student details. */
export interface ProviderBooking extends Booking {
  services: { name: string; provider_id: string } | null;
}
