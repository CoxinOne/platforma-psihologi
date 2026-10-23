export type UserRole = "client" | "psychologist" | "admin";
export type AccountStatus = "active" | "suspended" | "pending_deletion" | "deleted";
export type ProfessionalStatus = "draft" | "pending" | "approved" | "rejected" | "suspended";
export type ConsultationMode = "in_person" | "online";
export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "cancelled"
  | "completed"
  | "no_show";
export type NotificationType =
  | "message_new"
  | "appointment_requested"
  | "appointment_confirmed"
  | "appointment_rejected"
  | "appointment_cancelled"
  | "appointment_rescheduled"
  | "appointment_completed"
  | "account_status"
  | "professional_status"
  | "abuse_report"
  | "data_request"
  | "system";
export type ReportStatus = "open" | "in_review" | "resolved" | "dismissed";
export type DataRequestStatus = "pending" | "processing" | "completed" | "rejected";

export interface Profile {
  id: string;
  role: UserRole;
  requested_role: UserRole | null;
  full_name: string;
  email: string;
  phone: string | null;
  status: AccountStatus;
  is_demo: boolean;
  marketing_consent: boolean;
  terms_accepted_at: string | null;
  privacy_accepted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Specialty {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
}

export interface PublicSpecialty extends Specialty {
  psychologist_count: number;
}

export interface PublicCabinet {
  id: string;
  slug: string;
  name: string;
  address_line: string;
  city: string;
  county: string | null;
  postal_code: string | null;
  phone: string | null;
  description: string | null;
  is_demo: boolean;
  psychologist_count: number;
}

export interface CabinetSummary {
  id: string;
  slug: string;
  name: string;
  address_line: string;
  city: string;
  county: string | null;
  phone: string | null;
}

export interface PublicPsychologist {
  user_id: string;
  slug: string;
  display_name: string;
  professional_title: string;
  bio: string | null;
  education: string | null;
  experience: string | null;
  languages: string[];
  consultation_modes: ConsultationMode[];
  session_duration_minutes: number;
  price_ron: number | null;
  photo_path: string | null;
  is_accepting_new_clients: boolean;
  is_demo: boolean;
  is_verified: boolean;
  timezone: string;
  published_at: string | null;
  specialties: { slug: string; name: string }[];
  specialty_slugs: string[];
  cabinets: CabinetSummary[];
  cabinet_cities: string[];
}

export interface PsychologistProfile {
  user_id: string;
  slug: string;
  display_name: string;
  professional_title: string;
  bio: string | null;
  education: string | null;
  experience: string | null;
  languages: string[];
  consultation_modes: ConsultationMode[];
  session_duration_minutes: number;
  price_ron: number | null;
  timezone: string;
  photo_path: string | null;
  status: ProfessionalStatus;
  is_accepting_new_clients: boolean;
  is_demo: boolean;
  professional_registry_number: string | null;
  verification_note: string | null;
  verified_at: string | null;
  rejection_reason: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  client_id: string;
  psychologist_id: string;
  cabinet_id: string | null;
  starts_at: string;
  ends_at: string;
  duration_minutes: number;
  mode: ConsultationMode;
  status: AppointmentStatus;
  timezone: string;
  price_ron: number | null;
  currency: string;
  client_note: string | null;
  psychologist_note: string | null;
  cancellation_reason: string | null;
  cancelled_by: string | null;
  rescheduled_at: string | null;
  confirmed_at: string | null;
  cancelled_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface AppointmentWithNames extends Appointment {
  client: { full_name: string } | null;
  psychologist: { full_name: string } | null;
  cabinet: { name: string; city: string; address_line: string } | null;
}

export interface ConversationListItem {
  id: string;
  counterpart_id: string;
  counterpart_name: string;
  counterpart_photo: string | null;
  last_message_at: string;
  last_message_preview: string | null;
  unread_count: number;
  closed_at: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  action_url: string | null;
  metadata: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

export interface AvailabilityRule {
  id: string;
  psychologist_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  slot_step_minutes: number;
  mode: ConsultationMode;
  cabinet_id: string | null;
  valid_from: string | null;
  valid_to: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AvailabilityException {
  id: string;
  psychologist_id: string;
  exception_date: string;
  is_closed: boolean;
  start_time: string | null;
  end_time: string | null;
  slot_step_minutes: number;
  note: string | null;
  created_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  in_app: boolean;
  email_messages: boolean;
  email_appointments: boolean;
  updated_at: string;
}

export interface AbuseReport {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  conversation_id: string | null;
  category: string;
  details: string | null;
  status: ReportStatus;
  handled_by: string | null;
  resolution_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface DataRequest {
  id: string;
  user_id: string;
  type: "export" | "deletion";
  status: DataRequestStatus;
  note: string | null;
  requested_at: string;
  processed_at: string | null;
  processed_by: string | null;
}

export interface AuditLog {
  id: number;
  actor_id: string | null;
  actor_role: UserRole | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "read" | "archived";
  created_at: string;
  handled_at: string | null;
}

export interface AdminStats {
  users_total: number;
  clients: number;
  psychologists: number;
  admins: number;
  suspended: number;
  role_requests: number;
  profiles_pending: number;
  profiles_approved: number;
  profiles_draft: number;
  profiles_rejected: number;
  reports_open: number;
  data_requests_pending: number;
  appointments_pending: number;
  appointments_upcoming: number;
  contact_new: number;
  messages_total: number;
}
