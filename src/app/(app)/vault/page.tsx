import { createServerSupabaseClient as createServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Upload, Search, FolderOpen } from "lucide-react";
import { formatDate, getRecordTypeColor } from "@/lib/utils";
import { HealthRecord } from "@/types";
import VaultClient from "./VaultClient";

export const dynamic = "force-dynamic";

export default async function VaultPage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  const [{ data: records }, { data: members }] = await Promise.all([
    supabase.from("health_records").select("*, family_members(full_name, relation)").eq("user_id", session!.user.id).order("created_at", { ascending: false }),
    supabase.from("family_members").select("id, full_name").eq("user_id", session!.user.id),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Health Vault</h1>
          <p className="text-sm text-gray-500 mt-0.5">{records?.length || 0} records</p>
        </div>
        <Link href="/vault/upload" className="btn-primary">
          <Upload size={16} /> Upload Record
        </Link>
      </div>

      <VaultClient records={(records || []) as HealthRecord[]} members={members || []} />
    </div>
  );
}

