import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { FamilyMember, HealthReadinessScore } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function computeHealthReadiness(
  member: FamilyMember,
  hasRecords: boolean,
  hasDoctorSummary: boolean
): HealthReadinessScore {
  let score = 0;
  const missing: string[] = [];
  const breakdown = {
    blood_group: false,
    emergency_contact: false,
    allergies: false,
    medications: false,
    chronic_conditions: false,
    has_records: false,
    has_doctor_summary: false,
  };

  if (member.blood_group) {
    score += 15;
    breakdown.blood_group = true;
  } else {
    missing.push("Blood group");
  }

  if (member.emergency_contact_name && member.emergency_contact_phone) {
    score += 15;
    breakdown.emergency_contact = true;
  } else {
    missing.push("Emergency contact");
  }

  if (member.allergies && member.allergies.length > 0) {
    score += 15;
    breakdown.allergies = true;
  } else {
    missing.push("Allergy information");
  }

  if (member.current_medications && member.current_medications.length > 0) {
    score += 15;
    breakdown.medications = true;
  } else {
    missing.push("Current medication list");
  }

  if (member.chronic_conditions && member.chronic_conditions.length > 0) {
    score += 15;
    breakdown.chronic_conditions = true;
  } else {
    missing.push("Chronic conditions");
  }

  if (hasRecords) {
    score += 15;
    breakdown.has_records = true;
  } else {
    missing.push("Recent basic blood report");
  }

  if (hasDoctorSummary) {
    score += 10;
    breakdown.has_doctor_summary = true;
  } else {
    missing.push("Doctor visit summary");
  }

  return { score, missing, breakdown };
}

export function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getRelationIcon(relation: string) {
  const icons: Record<string, string> = {
    Self: "👤",
    Father: "👨",
    Mother: "👩",
    Grandparent: "👴",
    Spouse: "💑",
    Child: "👶",
    Other: "🧑",
  };
  return icons[relation] || "🧑";
}

export function getRecordTypeColor(type: string) {
  const colors: Record<string, string> = {
    "Lab Report": "bg-blue-100 text-blue-800",
    Prescription: "bg-green-100 text-green-800",
    "Discharge Summary": "bg-red-100 text-red-800",
    "Imaging Report": "bg-purple-100 text-purple-800",
    Vaccination: "bg-yellow-100 text-yellow-800",
    Insurance: "bg-gray-100 text-gray-800",
    "Surgery Record": "bg-orange-100 text-orange-800",
    Other: "bg-slate-100 text-slate-800",
  };
  return colors[type] || "bg-gray-100 text-gray-800";
}

export function getAbnormalStatusColor(status: string) {
  const colors: Record<string, string> = {
    high: "text-red-600 bg-red-50",
    low: "text-yellow-600 bg-yellow-50",
    normal: "text-green-600 bg-green-50",
    unknown: "text-gray-600 bg-gray-50",
  };
  return colors[status] || "text-gray-600 bg-gray-50";
}
