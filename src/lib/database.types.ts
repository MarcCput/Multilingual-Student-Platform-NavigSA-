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
}
