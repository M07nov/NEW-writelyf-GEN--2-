import { createServerSupabaseClient as createServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Clock } from "lucide-react";
import { formatDate, getRecordTypeColor } from "@/lib/utils";
import { TimelineEvent } from "@/types";
import TimelineClient from "./TimelineClient";

export const dynamic = "force-dynamic";

export default async function TimelinePage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  const [{ data: events }, { data: members }] = await Promise.all([
    supabase.from("timeline_events").select("*, family_members(full_name, relation), health_records(record_type)").eq("user_id", session!.user.id).order("event_date", { ascending: false }),
    supabase.from("family_members").select("id, full_name").eq("user_id", session!.user.id),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Health Timeline</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your family&apos;s complete health history</p>
      </div>
      <TimelineClient events={(events || []) as TimelineEvent[]} members={members || []} />
    </div>
  );
}

