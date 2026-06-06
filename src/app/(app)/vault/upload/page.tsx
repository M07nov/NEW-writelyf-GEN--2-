"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { ArrowLeft, Upload, File } from "lucide-react";
import Link from "next/link";

const RECORD_TYPES = ["Lab Report", "Prescription", "Discharge Summary", "Imaging Report", "Vaccination", "Insurance", "Surgery Record", "Other"];

export default function UploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<{ id: string; full_name: string }[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    family_member_id: searchParams.get("member") || "",
    title: "",
    record_type: "Lab Report",
    record_date: "",
    provider_name: "",
    doctor_name: "",
    notes: "",
    ai_summarize: true,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      supabase.from("family_members").select("id, full_name").eq("user_id", session!.user.id).then(({ data }) => {
        setMembers(data || []);
        if (!form.family_member_id && data && data.length > 0) {
          setForm((f) => ({ ...f, family_member_id: data[0].id }));
        }
      });
    });
  }, []);

  function set(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { toast.error("Please select a file"); return; }
    if (!form.family_member_id) { toast.error("Please select a family member"); return; }
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session!.user.id;

      // Insert record first to get ID
      const { data: record, error: recErr } = await supabase.from("health_records").insert({
        user_id: userId,
        family_member_id: form.family_member_id,
        title: form.title || file.name,
        record_type: form.record_type,
        record_date: form.record_date || null,
        provider_name: form.provider_name,
        doctor_name: form.doctor_name,
        notes: form.notes,
        file_name: file.name,
        file_type: file.type,
        ai_status: form.ai_summarize ? "pending" : "failed",
      }).select().single();

      if (recErr) throw recErr;

      // Upload file
      const filePath = `${userId}/${record.id}/${file.name}`;
      const { error: uploadErr } = await supabase.storage.from("health-records").upload(filePath, file);
      if (uploadErr) throw uploadErr;

      // Update record with file URL
      const { data: { publicUrl } } = supabase.storage.from("health-records").getPublicUrl(filePath);
      await supabase.from("health_records").update({ file_url: filePath }).eq("id", record.id);

      // Create timeline event
      await supabase.from("timeline_events").insert({
        user_id: userId,
        family_member_id: form.family_member_id,
        record_id: record.id,
        event_type: "record_uploaded",
        title: `${form.record_type} uploaded`,
        description: form.title || file.name,
        event_date: form.record_date || new Date().toISOString().split("T")[0],
      });

      // Trigger AI summarization if enabled
      if (form.ai_summarize) {
        fetch("/api/ai/summarize-record", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recordId: record.id, recordType: form.record_type }),
        }).catch(() => {});
      }

      toast.success("Record uploaded successfully!");
      router.push(`/vault/${record.id}`);
    } catch (err: unknown) {
      toast.error((err as Error).message || "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/vault" className="btn-ghost"><ArrowLeft size={16} /></Link>
        <h1 className="page-title">Upload Record</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* File drop */}
        <div className="card">
          <label className="label">Medical File *</label>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-10 cursor-pointer hover:border-brand-red hover:bg-red-50 transition-colors">
            {file ? (
              <div className="text-center">
                <File className="w-10 h-10 text-brand-red mx-auto mb-2" />
                <p className="font-medium text-gray-800">{file.name}</p>
                <p className="text-sm text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">Click to upload or drag file</p>
                <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 20MB</p>
              </div>
            )}
            <input
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.heic"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setFile(f);
                  if (!form.title) set("title", f.name.replace(/\.[^.]+$/, ""));
                }
              }}
            />
          </label>
        </div>

        {/* Details */}
        <div className="card space-y-4">
          <h2 className="section-title">Record Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Family Member *</label>
              <select className="input" value={form.family_member_id} onChange={(e) => set("family_member_id", e.target.value)} required>
                <option value="">Select member</option>
                {members.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Title</label>
              <input className="input" placeholder="e.g. CBC Blood Test - June 2026" value={form.title} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div>
              <label className="label">Record Type *</label>
              <select className="input" value={form.record_type} onChange={(e) => set("record_type", e.target.value)}>
                {RECORD_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Record Date</label>
              <input type="date" className="input" value={form.record_date} onChange={(e) => set("record_date", e.target.value)} />
            </div>
            <div>
              <label className="label">Hospital / Lab Name</label>
              <input className="input" placeholder="e.g. Apollo Hospitals" value={form.provider_name} onChange={(e) => set("provider_name", e.target.value)} />
            </div>
            <div>
              <label className="label">Doctor Name</label>
              <input className="input" placeholder="e.g. Dr. Sharma" value={form.doctor_name} onChange={(e) => set("doctor_name", e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="label">Notes</label>
              <textarea className="input min-h-20 resize-none" placeholder="Any additional notes..." value={form.notes} onChange={(e) => set("notes", e.target.value)} />
            </div>
          </div>
        </div>

        {/* AI option */}
        <div className="card">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 w-4 h-4 accent-brand-red rounded"
              checked={form.ai_summarize}
              onChange={(e) => set("ai_summarize", e.target.checked)}
            />
            <div>
              <p className="font-medium text-gray-800">Allow AI to summarize this record</p>
              <p className="text-sm text-gray-400 mt-0.5">AI will extract key findings and create an easy-to-understand summary. Educational only — not a diagnosis.</p>
            </div>
          </label>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary" disabled={loading}>
            <Upload size={16} />
            {loading ? "Uploading..." : "Upload Record"}
          </button>
          <Link href="/vault" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
