"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import Link from "next/link";
import { FileText, Plus, Clock } from "lucide-react";

export default function DoctorSummaryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<{ id: string; full_name: string }[]>([]);
  const [records, setRecords] = useState<{ id: string; title: string; record_type: string }[]>([]);
  const [pastSummaries, setPastSummaries] = useState<{ id: string; chief_complaint: string; created_at: string }[]>([]);
  const [form, setForm] = useState({
    family_member_id: searchParams.get("member") || "",
    chief_complaint: "",
    duration: "",
    symptoms: "",
    current_medicines: "",
    allergies: "",
    questions: "",
    selected_record_ids: [] as string[],
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const uid = session!.user.id;
      Promise.all([
        supabase.from("family_members").select("id, full_name").eq("user_id", uid),
        supabase.from("doctor_summaries").select("id, chief_complaint, created_at").eq("user_id", uid).order("created_at", { ascending: false }).limit(5),
      ]).then(([{ data: m }, { data: s }]) => {
        setMembers(m || []);
        setPastSummaries(s || []);
        if (!form.family_member_id && m && m.length > 0) {
          setForm((f) => ({ ...f, family_member_id: m[0].id }));
        }
      });
    });
  }, []);

  useEffect(() => {
    if (!form.family_member_id) return;
    supabase.from("health_records").select("id, title, record_type").eq("family_member_id", form.family_member_id).then(({ data }) => {
      setRecords(data || []);
    });
  }, [form.family_member_id]);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleRecord(id: string) {
    setForm((f) => ({
      ...f,
      selected_record_ids: f.selected_record_ids.includes(id)
        ? f.selected_record_ids.filter((r) => r !== id)
        : [...f.selected_record_ids, id],
    }));
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.family_member_id) { toast.error("Select a family member"); return; }
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch("/api/doctor-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, user_id: session!.user.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      toast.success("Doctor summary generated!");
      router.push(`/doctor-summary/${data.id}`);
    } catch (err: unknown) {
      toast.error((err as Error).message || "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Doctor Visit Summary</h1>
          <p className="text-sm text-gray-500 mt-0.5">Generate a structured summary for your next doctor visit</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleGenerate} className="space-y-5">
            <div className="card space-y-4">
              <h2 className="section-title">Patient & Visit</h2>
              <div>
                <label className="label">Family Member *</label>
                <select className="input" value={form.family_member_id} onChange={(e) => set("family_member_id", e.target.value)} required>
                  <option value="">Select member</option>
                  {members.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Chief Complaint *</label>
                  <input className="input" placeholder="e.g. Chest pain" value={form.chief_complaint} onChange={(e) => set("chief_complaint", e.target.value)} required />
                </div>
                <div>
                  <label className="label">Duration</label>
                  <input className="input" placeholder="e.g. 3 days" value={form.duration} onChange={(e) => set("duration", e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Symptoms <span className="text-gray-400 font-normal">(comma separated)</span></label>
                <textarea className="input min-h-20 resize-none" placeholder="e.g. Fever, Cough, Breathlessness" value={form.symptoms} onChange={(e) => set("symptoms", e.target.value)} />
              </div>
            </div>

            <div className="card space-y-4">
              <h2 className="section-title">Medical History</h2>
              <div>
                <label className="label">Current Medicines</label>
                <textarea className="input min-h-20 resize-none" placeholder="List all current medications..." value={form.current_medicines} onChange={(e) => set("current_medicines", e.target.value)} />
              </div>
              <div>
                <label className="label">Allergies</label>
                <input className="input" placeholder="Known allergies..." value={form.allergies} onChange={(e) => set("allergies", e.target.value)} />
              </div>
            </div>

            {records.length > 0 && (
              <div className="card">
                <h2 className="section-title mb-3">Include Records</h2>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {records.map((r) => (
                    <label key={r.id} className="flex items-center gap-3 py-2 px-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-brand-red"
                        checked={form.selected_record_ids.includes(r.id)}
                        onChange={() => toggleRecord(r.id)}
                      />
                      <span className="text-sm font-medium flex-1">{r.title}</span>
                      <span className="text-xs text-gray-400">{r.record_type}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="card">
              <label className="label">Questions for Doctor</label>
              <textarea className="input min-h-24 resize-none" placeholder="What do you want to ask your doctor?&#10;e.g. Is my blood sugar under control?&#10;Should I continue this medication?" value={form.questions} onChange={(e) => set("questions", e.target.value)} />
            </div>

            <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
              <FileText size={16} />
              {loading ? "Generating Summary..." : "Generate Doctor Summary"}
            </button>
          </form>
        </div>

        {/* Past summaries */}
        <div>
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} className="text-gray-400" />
              <h2 className="section-title">Past Summaries</h2>
            </div>
            {pastSummaries.length === 0 ? (
              <p className="text-sm text-gray-400">No summaries generated yet.</p>
            ) : (
              <div className="space-y-3">
                {pastSummaries.map((s) => (
                  <Link key={s.id} href={`/doctor-summary/${s.id}`} className="block py-2 px-3 hover:bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-800 truncate">{s.chief_complaint || "Visit summary"}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(s.created_at).toLocaleDateString("en-IN")}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
