"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { User, Shield, Download, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string; full_name?: string } | null>(null);
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser({ email: user.email, full_name: user.user_metadata?.full_name });
        setFullName(user.user_metadata?.full_name || "");
      }
    });
  }, []);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated!");
  }

  async function handleDeleteAccount() {
    const confirmed = confirm("Are you sure? This will permanently delete your account and all health records. This cannot be undone.");
    if (!confirmed) return;
    const confirmed2 = confirm("Final confirmation: delete everything?");
    if (!confirmed2) return;
    toast.error("Please contact support to delete your account. We need to verify your identity for data safety.");
  }

  async function handleExport() {
    toast.success("Data export feature coming soon. You'll receive a download link via email.");
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="page-title">Settings</h1>
      </div>

      <div className="space-y-5">
        {/* Profile */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <User size={18} className="text-gray-400" />
            <h2 className="section-title">Profile</h2>
          </div>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input bg-gray-50" value={user?.email || ""} disabled />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
            </div>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Privacy */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={18} className="text-gray-400" />
            <h2 className="section-title">Privacy & Data</h2>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Your health data is encrypted and stored securely. We never sell or share your data with third parties.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="/legal/privacy" target="_blank" className="text-sm text-brand-red hover:underline">Privacy Policy</a>
              <a href="/legal/terms" target="_blank" className="text-sm text-brand-red hover:underline">Terms of Use</a>
              <a href="/legal/medical-disclaimer" target="_blank" className="text-sm text-brand-red hover:underline">Medical Disclaimer</a>
            </div>
          </div>
        </div>

        {/* Data export */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Download size={18} className="text-gray-400" />
            <h2 className="section-title">Export Your Data</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">Download all your health records and data in a portable format.</p>
          <button onClick={handleExport} className="btn-secondary">
            <Download size={16} /> Request Data Export
          </button>
        </div>

        {/* Delete account */}
        <div className="card border-red-100">
          <div className="flex items-center gap-2 mb-4">
            <Trash2 size={18} className="text-red-400" />
            <h2 className="section-title text-red-700">Danger Zone</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">Permanently delete your account and all associated health records. This action cannot be undone.</p>
          <button onClick={handleDeleteAccount} className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
