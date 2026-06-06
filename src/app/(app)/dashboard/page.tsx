import { createServerSupabaseClient as createServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate, getRelationIcon, computeHealthReadiness, getRecordTypeColor } from "@/lib/utils";
import { Upload, Plus, FileText, QrCode, Clock, Users } from "lucide-react";
import { FamilyMember, HealthRecord, TimelineEvent } from "@/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session!.user.id;
  const userName = session!.user.user_metadata?.full_name || session!.user.email?.split("@")[0];

  const [{ data: members }, { data: records }, { data: timeline }] = await Promise.all([
    supabase.from("family_members").select("*").eq("user_id", userId).order("created_at"),
    supabase.from("health_records").select("*, family_members(full_name)").eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
    supabase.from("timeline_events").select("*, family_members(full_name)").eq("user_id", userId).order("event_date", { ascending: false }).limit(5),
  ]);

  const familyMembers: FamilyMember[] = members || [];
  const recentRecords: HealthRecord[] = (records || []) as HealthRecord[];
  const recentTimeline: TimelineEvent[] = (timeline || []) as TimelineEvent[];

  // Compute average readiness score
  const avgScore = familyMembers.length
    ? Math.round(
        familyMembers.reduce((acc, m) => {
          const { score } = computeHealthReadiness(m, false, false);
          return acc + score;
        }, 0) / familyMembers.length
      )
    : 0;

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Good day, {userName} ðŸ‘‹
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Your family&apos;s health memory is here.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { href: "/vault/upload", label: "Upload Record", icon: Upload, color: "bg-red-500" },
          { href: "/family/new", label: "Add Member", icon: Plus, color: "bg-blue-500" },
          { href: "/doctor-summary", label: "Doctor Summary", icon: FileText, color: "bg-green-500" },
          { href: "/emergency-card", label: "Emergency Card", icon: QrCode, color: "bg-purple-500" },
        ].map(({ href, label, icon: Icon, color }) => (
          <Link key={href} href={href} className="card hover:shadow-md transition-shadow flex flex-col items-center gap-3 py-5 text-center">
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">{label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Family Profiles */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Family Profiles</h2>
            <Link href="/family" className="text-sm text-brand-red hover:underline flex items-center gap-1">
              <Users size={14} /> View all
            </Link>
          </div>
          {familyMembers.length === 0 ? (
            <div className="card text-center py-10">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm mb-4">No family profiles yet</p>
              <Link href="/family/new" className="btn-primary">
                <Plus size={16} /> Add Family Member
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {familyMembers.map((m) => {
                const { score } = computeHealthReadiness(m, false, false);
                return (
                  <Link key={m.id} href={`/family/${m.id}`} className="card hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getRelationIcon(m.relation)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{m.full_name}</p>
                        <p className="text-xs text-gray-400">{m.relation}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Health Readiness</span>
                        <span className="font-semibold text-gray-700">{score}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${score}%`,
                            background: score >= 70 ? "#27AE60" : score >= 40 ? "#F39C12" : "#C0392B",
                          }}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Overall readiness */}
          <div className="card">
            <h2 className="section-title mb-4">Overall Readiness</h2>
            <div className="text-center">
              <div
                className="text-4xl font-bold mb-1"
                style={{ color: avgScore >= 70 ? "#27AE60" : avgScore >= 40 ? "#F39C12" : "#C0392B" }}
              >
                {avgScore}%
              </div>
              <p className="text-xs text-gray-400">across {familyMembers.length} profile{familyMembers.length !== 1 ? "s" : ""}</p>
            </div>
          </div>

          {/* Recent records */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Recent Records</h2>
              <Link href="/vault" className="text-xs text-brand-red hover:underline">View all</Link>
            </div>
            {recentRecords.length === 0 ? (
              <p className="text-sm text-gray-400">No records uploaded yet.</p>
            ) : (
              <div className="space-y-3">
                {recentRecords.map((r) => (
                  <Link key={r.id} href={`/vault/${r.id}`} className="flex items-start gap-3 hover:bg-gray-50 -mx-2 px-2 py-1.5 rounded-lg">
                    <span className={`badge ${getRecordTypeColor(r.record_type)} whitespace-nowrap`}>
                      {r.record_type}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{r.title}</p>
                      <p className="text-xs text-gray-400">{r.record_date ? formatDate(r.record_date) : "â€”"}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Timeline preview */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Timeline</h2>
              <Link href="/timeline" className="text-xs text-brand-red hover:underline flex items-center gap-1">
                <Clock size={12} /> View
              </Link>
            </div>
            {recentTimeline.length === 0 ? (
              <p className="text-sm text-gray-400">No timeline events yet.</p>
            ) : (
              <div className="space-y-3">
                {recentTimeline.map((e) => (
                  <div key={e.id} className="flex gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-brand-red mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-800">{e.title}</p>
                      <p className="text-xs text-gray-400">{e.event_date ? formatDate(e.event_date) : ""}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

