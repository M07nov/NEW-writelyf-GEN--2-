"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";

const RELATIONS = ["Self", "Father", "Mother", "Grandparent", "Spouse", "Child", "Other"];
const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-", "Unknown"];

export default function EditFamilyMemberPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    full_name: "", relation: "Self", date_of_birth: "", gender: "", blood_group: "",
    allergies: "", chronic_conditions: "", current_medications: "",
    emergency_contact_name: "", emergency_contact_phone: "", notes: "",
  });

  useEffect(() => {
    supabase.from("family_members").select("*").eq("id", params.id).single().then(({ data }) => {
      if (data) {
        setForm({
          ...data,
          allergies: data.allergies?.join(", ") || "",
          chronic_conditions: data.chronic_conditions?.join(", ") || "",
          current_medications: data.current_medications?.join(", ") || "",
          date_of_birth: data.date_of_birth || "",
        });
      }
    });
  }, [params.id]);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("family_members").update({
      ...form,
      allergies: form.allergies ? form.allergies.split(",").map((s) => s.trim()).filter(Boolean) : [],
      chronic_conditions: form.chronic_conditions ? form.chronic_conditions.split(",").map((s) => s.trim()).filter(Boolean) : [],
      current_medications: form.current_medications ? form.current_medications.split(",").map((s) => s.trim()).filter(Boolean) : [],
    }).eq("id", params.id);
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Profile updated!"); router.push(`/family/${params.id}`); }
  }

  async function handleDelete() {
    if (!confirm("Delete this profile? All associated records will also be deleted.")) return;
    setDeleting(true);
    const { error } = await supabase.from("family_members").delete().eq("id", params.id);
    setDeleting(false);
    if (error) toast.error(error.message);
    else { toast.success("Profile deleted"); router.push("/family"); }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href={`/family/${params.id}`} className="btn-ghost"><ArrowLeft size={16} /></Link>
          <h1 className="page-title">Edit Profile</h1>
        </div>
        <button onClick={handleDelete} disabled={deleting} className="text-red-500 hover:text-red-700 flex items-center gap-1.5 text-sm font-medium px-3 py-2 hover:bg-red-50 rounded-xl transition-colors">
          <Trash2 size={15} /> {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4">
          <h2 className="section-title">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Full Name *</label>
              <input className="input" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} required />
            </div>
            <div>
              <label className="label">Relation</label>
              <select className="input" value={form.relation} onChange={(e) => set("relation", e.target.value)}>
                {RELATIONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Gender</label>
              <select className="input" value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                <option value="">Select gender</option>
                {GENDERS.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Date of Birth</label>
              <input type="date" className="input" value={form.date_of_birth} onChange={(e) => set("date_of_birth", e.target.value)} />
            </div>
            <div>
              <label className="label">Blood Group</label>
              <select className="input" value={form.blood_group} onChange={(e) => set("blood_group", e.target.value)}>
                <option value="">Select</option>
                {BLOOD_GROUPS.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="section-title">Medical Information</h2>
          <div>
            <label className="label">Allergies (comma separated)</label>
            <input className="input" value={form.allergies} onChange={(e) => set("allergies", e.target.value)} />
          </div>
          <div>
            <label className="label">Chronic Conditions (comma separated)</label>
            <input className="input" value={form.chronic_conditions} onChange={(e) => set("chronic_conditions", e.target.value)} />
          </div>
          <div>
            <label className="label">Current Medications (comma separated)</label>
            <input className="input" value={form.current_medications} onChange={(e) => set("current_medications", e.target.value)} />
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="section-title">Emergency Contact</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Name</label>
              <input className="input" value={form.emergency_contact_name} onChange={(e) => set("emergency_contact_name", e.target.value)} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.emergency_contact_phone} onChange={(e) => set("emergency_contact_phone", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card">
          <label className="label">Notes</label>
          <textarea className="input min-h-24 resize-none" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary" disabled={loading}>
            <Save size={16} /> {loading ? "Saving..." : "Save Changes"}
          </button>
          <Link href={`/family/${params.id}`} className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
