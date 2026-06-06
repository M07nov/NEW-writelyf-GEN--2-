import { createServerSupabaseClient as createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Clock, FolderOpen, QrCode, FileText } from "lucide-react";
import { formatDate, getRelationIcon, computeHealthReadiness, getRecordTypeColor } from "@/lib/utils";
import { FamilyMember, HealthRecord } from "@/types";

export const dynamic = "force-dynamic";

export default async function FamilyMemberPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  const [{ data: member }, { data: records }, { data: summaries }] = await Promise.all([
    supabase.from("family_members").select("*").eq("id", params.id).eq("user_id", session!.user.id).single(),
    supabase.from("health_records").select("*").eq("family_member_id", params.id).order("record_date", { ascending: false }),
    supabase.from("doctor_summaries").select("id").eq("family_member_id", params.id).limit(1),
  ]);

  if (!member) notFound();

  const m = member as FamilyMember;
  const recs: HealthRecord[] = (records || []) as HealthRecord[];
  const hasDocSummary = (summaries?.length || 0) > 0;
  const { score, missing, breakdown } = computeHealthReadiness(m, recs.length > 0, hasDocSummary);

  const age = m.date_of_birth
    ? Math.floor((Date.now() - new Date(m.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365))
    : null;

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/family" className="btn-ghost">
            <ArrowLeft size={16} />
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{getRelationIcon(m.relation)}</span>
            <div>
              <h1 className="page-title">{m.full_name}</h1>
              <p className="text-gray-400 text-sm">{m.relation}{age ? ` · ${age} years old` : ""}</p>
            </div>
          </div>
        </div>
        <Link href={`/family/${m.id}/edit`} className="btn-secondary">
          <Edit size={16} /> Edit Profile
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Profile details */}
          <div className="card">
            <h2 className="section-title mb-4">Profile Details</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Blood Group", value: m.blood_group || "Not set" },
                { label: "Gender", value: m.gender || "Not set" },
                { label: "Date of Birth", value: m.date_of_birth ? formatDate(m.date_of_birth) : "Not set" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-gray-800">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Medical */}
          <div className="card space-y-4">
            <h2 className="section-title">Medical Information</h2>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Allergies</p>
              <div className="flex flex-wrap gap-2">
                {m.allergies?.length > 0
                  ? m.allergies.map((a) => <span key={a} className="badge bg-red-50 text-red-700">{a}</span>)
                  : <span className="text-sm text-gray-400">None recorded</span>}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Chronic Conditions</p>
              <div className="flex flex-wrap gap-2">
                {m.chronic_conditions?.length > 0
                  ? m.chronic_conditions.map((c) => <span key={c} className="badge bg-orange-50 text-orange-700">{c}</span>)
                  : <span className="text-sm text-gray-400">None recorded</span>}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Current Medications</p>
              <div className="flex flex-wrap gap-2">
                {m.current_medications?.length > 0
                  ? m.current_medications.map((med) => <span key={med} className="badge bg-blue-50 text-blue-700">{med}</span>)
                  : <span className="text-sm text-gray-400">None recorded</span>}
              </div>
            </div>
          </div>

          {/* Emergency contact */}
          <div className="card">
            <h2 className="section-title mb-3">Emergency Contact</h2>
            {m.emergency_contact_name ? (
              <div>
                <p className="font-medium text-gray-800">{m.emergency_contact_name}</p>
                <p className="text-gray-500 text-sm">{m.emergency_contact_phone}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No emergency contact added</p>
            )}
          </div>

          {/* Records */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Records ({recs.length})</h2>
              <Link href={`/vault/upload?member=${m.id}`} className="text-sm text-brand-red hover:underline flex items-center gap-1">
                <FolderOpen size={14} /> Upload
              </Link>
            </div>
            {recs.length === 0 ? (
              <p className="text-sm text-gray-400">No records uploaded yet.</p>
            ) : (
              <div className="space-y-2">
                {recs.map((r) => (
                  <Link key={r.id} href={`/vault/${r.id}`} className="flex items-center gap-3 py-2 px-3 hover:bg-gray-50 rounded-lg">
                    <span className={`badge ${getRecordTypeColor(r.record_type)}`}>{r.record_type}</span>
                    <p className="text-sm font-medium flex-1 truncate">{r.title}</p>
                    <p className="text-xs text-gray-400">{r.record_date ? formatDate(r.record_date) : ""}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Readiness score */}
          <div className="card">
            <h2 className="section-title mb-4">Health Readiness</h2>
            <div className="text-center mb-4">
              <div
                className="text-5xl font-bold mb-1"
                style={{ color: score >= 70 ? "#27AE60" : score >= 40 ? "#F39C12" : "#C0392B" }}
              >
                {score}%
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${score}%`,
                  background: score >= 70 ? "#27AE60" : score >= 40 ? "#F39C12" : "#C0392B",
                }}
              />
            </div>
            <div className="space-y-2">
              {[
                { key: "blood_group", label: "Blood group", done: breakdown.blood_group },
                { key: "emergency_contact", label: "Emergency contact", done: breakdown.emergency_contact },
                { key: "allergies", label: "Allergies", done: breakdown.allergies },
                { key: "medications", label: "Medications", done: breakdown.medications },
                { key: "chronic_conditions", label: "Conditions", done: breakdown.chronic_conditions },
                { key: "has_records", label: "Health record", done: breakdown.has_records },
                { key: "has_doctor_summary", label: "Doctor summary", done: breakdown.has_doctor_summary },
              ].map(({ key, label, done }) => (
                <div key={key} className="flex items-center gap-2 text-xs">
                  <span className={done ? "text-green-500" : "text-gray-300"}>
                    {done ? "✓" : "○"}
                  </span>
                  <span className={done ? "text-gray-700" : "text-gray-400"}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="card space-y-2">
            <h2 className="section-title mb-3">Quick Actions</h2>
            <Link href={`/timeline?member=${m.id}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand-red py-2 px-3 hover:bg-red-50 rounded-lg transition-colors">
              <Clock size={16} /> View Timeline
            </Link>
            <Link href={`/doctor-summary?member=${m.id}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand-red py-2 px-3 hover:bg-red-50 rounded-lg transition-colors">
              <FileText size={16} /> Generate Doctor Summary
            </Link>
            <Link href={`/emergency-card?member=${m.id}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand-red py-2 px-3 hover:bg-red-50 rounded-lg transition-colors">
              <QrCode size={16} /> Emergency Card
            </Link>
          </div>

          {/* Notes */}
          {m.notes && (
            <div className="card">
              <h2 className="section-title mb-2">Notes</h2>
              <p className="text-sm text-gray-600">{m.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
