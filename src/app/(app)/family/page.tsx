import { createServerSupabaseClient as createServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { computeHealthReadiness, getRelationIcon } from "@/lib/utils";
import { FamilyMember } from "@/types";

export const dynamic = "force-dynamic";

export default async function FamilyPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  const { data: members } = await supabase
    .from("family_members")
    .select("*")
    .eq("user_id", session!.user.id)
    .order("created_at");

  const familyMembers: FamilyMember[] = members || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Family Profiles</h1>
          <p className="text-sm text-gray-500 mt-0.5">{familyMembers.length} profile{familyMembers.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/family/new" className="btn-primary">
          <Plus size={16} /> Add Member
        </Link>
      </div>

      {familyMembers.length === 0 ? (
        <div className="card text-center py-16">
          <Users className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">No family profiles yet</h2>
          <p className="text-gray-400 text-sm mb-6">Add profiles for yourself and your family members to get started.</p>
          <Link href="/family/new" className="btn-primary">
            <Plus size={16} /> Add First Member
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {familyMembers.map((m) => {
            const { score, missing } = computeHealthReadiness(m, false, false);
            return (
              <Link
                key={m.id}
                href={`/family/${m.id}`}
                className="card hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col gap-4"
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{getRelationIcon(m.relation)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{m.full_name}</p>
                    <p className="text-sm text-gray-400">{m.relation}</p>
                    {m.blood_group && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-red-50 text-brand-red text-xs font-semibold rounded-md">
                        {m.blood_group}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-gray-500">Health Readiness</span>
                    <span
                      className="font-bold"
                      style={{ color: score >= 70 ? "#27AE60" : score >= 40 ? "#F39C12" : "#C0392B" }}
                    >
                      {score}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${score}%`,
                        background: score >= 70 ? "#27AE60" : score >= 40 ? "#F39C12" : "#C0392B",
                      }}
                    />
                  </div>
                </div>

                {missing.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Missing:</p>
                    <div className="flex flex-wrap gap-1">
                      {missing.slice(0, 3).map((item) => (
                        <span key={item} className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                          {item}
                        </span>
                      ))}
                      {missing.length > 3 && (
                        <span className="text-xs text-gray-400">+{missing.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )}
              </Link>
            );
          })}

          {/* Add card */}
          <Link
            href="/family/new"
            className="card border-2 border-dashed border-gray-200 hover:border-brand-red hover:bg-red-50 transition-colors flex flex-col items-center justify-center gap-3 py-10 text-gray-400 hover:text-brand-red"
          >
            <Plus size={24} />
            <span className="text-sm font-medium">Add Family Member</span>
          </Link>
        </div>
      )}
    </div>
  );
}

