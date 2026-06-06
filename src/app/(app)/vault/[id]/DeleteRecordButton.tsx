"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";

export default function DeleteRecordButton({ recordId, fileUrl }: { recordId: string; fileUrl: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete() {
    if (!confirm("Delete this record? This cannot be undone.")) return;
    setLoading(true);
    if (fileUrl) {
      await supabase.storage.from("health-records").remove([fileUrl]);
    }
    const { error } = await supabase.from("health_records").delete().eq("id", recordId);
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Record deleted"); router.push("/vault"); }
  }

  return (
    <button onClick={handleDelete} disabled={loading} className="btn-ghost text-red-500 hover:bg-red-50 hover:text-red-700">
      <Trash2 size={16} />
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
