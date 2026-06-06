export interface FamilyMember {
  id: string;
  user_id: string;
  full_name: string;
  relation: string;
  date_of_birth: string;
  gender: string;
  blood_group: string;
  allergies: string[];
  chronic_conditions: string[];
  current_medications: string[];
  emergency_contact_name: string;
  emergency_contact_phone: string;
  notes: string;
  created_at: string;
}

export interface HealthRecord {
  id: string;
  user_id: string;
  family_member_id: string;
  title: string;
  record_type: string;
  record_date: string;
  provider_name: string;
  doctor_name: string;
  notes: string;
  file_url: string;
  file_name: string;
  file_type: string;
  ai_status: "pending" | "processed" | "failed";
  created_at: string;
  family_members?: FamilyMember;
}

export interface AbnormalValue {
  test_name: string;
  value: string;
  unit: string;
  reference_range: string;
  status: "high" | "low" | "normal" | "unknown";
  explanation: string;
}

export interface AIRecordSummary {
  id: string;
  user_id: string;
  record_id: string;
  summary: string;
  key_findings: string[];
  abnormal_values: AbnormalValue[];
  doctor_questions: string[];
  safety_note: string;
  raw_ai_output: Record<string, unknown>;
  created_at: string;
}

export interface TimelineEvent {
  id: string;
  user_id: string;
  family_member_id: string;
  record_id: string | null;
  event_type: string;
  title: string;
  description: string;
  event_date: string;
  metadata: Record<string, unknown>;
  created_at: string;
  family_members?: FamilyMember;
  health_records?: HealthRecord;
}

export interface DoctorSummary {
  id: string;
  user_id: string;
  family_member_id: string;
  chief_complaint: string;
  duration: string;
  symptoms: string[];
  selected_record_ids: string[];
  current_medicines: string;
  allergies: string;
  questions: string;
  generated_summary: string;
  created_at: string;
  family_members?: FamilyMember;
}

export interface EmergencyCard {
  id: string;
  user_id: string;
  family_member_id: string;
  share_id: string;
  visible_fields: Record<string, boolean>;
  is_active: boolean;
  created_at: string;
  family_members?: FamilyMember;
}

export interface HealthReadinessScore {
  score: number;
  missing: string[];
  breakdown: {
    blood_group: boolean;
    emergency_contact: boolean;
    allergies: boolean;
    medications: boolean;
    chronic_conditions: boolean;
    has_records: boolean;
    has_doctor_summary: boolean;
  };
}

export type RecordType =
  | "Lab Report"
  | "Prescription"
  | "Discharge Summary"
  | "Imaging Report"
  | "Vaccination"
  | "Insurance"
  | "Surgery Record"
  | "Other";

export type RelationType =
  | "Self"
  | "Father"
  | "Mother"
  | "Grandparent"
  | "Spouse"
  | "Child"
  | "Other";
