"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

const RELATIONS = ["Self", "Father", "Mother", "Grandparent", "Spouse", "Child", "Other"];
const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-", "Unknown"];

export default function NewFamilyMemberPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    relation: "Self",
    date_of_birth: "",
    gender: "",
    blood_group: "",
    allergies: "",
    chronic_conditions: "",
    current_medications: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    notes: "",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const { data, error } = await supabase.from("family_members").insert({
      user_id: session!.user.id,
      ...form,
      allergies: form.allergies ? form.allergies.split(",").map((s) => s.trim()).filter(Boolean) : [],
      chronic_conditions: form.chronic_conditions ? form.chronic_conditions.split(",").map((s) => s.trim()).filter(Boolean) : [],
      current_medications: form.current_medications ? form.current_medications.split(",").map((s) => s.trim()).filter(Boolean) : [],
    }).select().single();
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`${form.full_name} added!`);
      router.push(`/family/${data.id}`);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/family" className="btn-ghost">
          <ArrowLeft size={16} /> Back
        </Link>
        <div>
          <h1 className="page-title">Add Family Member</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="card space-y-4">
          <h2 className="section-title">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Full Name *</label>
              <input className="input" placeholder="Full name" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} required />
            </div>
            <div>
              <label className="label">Relation *</label>
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
                <option value="">Select blood group</option>
                {BLOOD_GROUPS.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Medical info */}
        <div className="card space-y-4">
          <h2 className="section-title">Medical Information</h2>
          <div>
            <label className="label">Allergies <span className="text-gray-400 font-normal">(comma separated)</span></label>
            <input className="input" placeholder="e.g. Penicillin, Peanuts, Dust" value={form.allergies} onChange={(e) => set("allergies", e.target.value)} />
          </div>
          <div>
            <label className="label">Chronic Conditions <span className="text-gray-400 font-normal">(comma separated)</span></label>
            <input className="input" placeholder="e.g. Diabetes, Hypertension" value={form.chronic_conditions} onChange={(e) => set("chronic_conditions", e.target.value)} />
          </div>
          <div>
            <label className="label">Current Medications <span className="text-gray-400 font-normal">(comma separated)</span></label>
            <input className="input" placeholder="e.g. Metformin 500mg, Amlodipine 5mg" value={form.current_medications} onChange={(e) => set("current_medications", e.target.value)} />
          </div>
        </div>

        {/* Emergency contact */}
        <div className="card space-y-4">
          <h2 className="section-title">Emergency Contact</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Contact Name</label>
              <input className="input" placeholder="Contact person name" value={form.emergency_contact_name} onChange={(e) => set("emergency_contact_name", e.target.value)} />
            </div>
            <div>
              <label className="label">Contact Phone</label>
              <input className="input" placeholder="+91 98765 43210" value={form.emergency_contact_phone} onChange={(e) => set("emergency_contact_phone", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="card">
          <label className="label">Additional Notes</label>
          <textarea className="input min-h-24 resize-none" placeholder="Any other important health information..." value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary" disabled={loading}>
            <Save size={16} />
            {loading ? "Saving..." : "Save Profile"}
          </button>
          <Link href="/family" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
