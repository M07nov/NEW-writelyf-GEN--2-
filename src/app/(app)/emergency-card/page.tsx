"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import Link from "next/link";
import { QrCode, Plus, ExternalLink, Power } from "lucide-react";
import QRCode from "react-qr-code";
import { EmergencyCard, FamilyMember } from "@/types";
import { nanoid } from "nanoid";
import { getRelationIcon } from "@/lib/utils";

const DEFAULT_FIELDS = {
  name: true, age: true, blood_group: true, allergies: true,
  chronic_conditions: true, current_medications: true, emergency_contact: true, notes: false,
};

export default function EmergencyCardPage() {
  const supabase = createClient();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [cards, setCards] = useState<EmergencyCard[]>([]);
  const [creating, setCreating] = useState(false);
  const [selectedMember, setSelectedMember] = useState("");
  const [fields, setFields] = useState<Record<string, boolean>>(DEFAULT_FIELDS);

  const appUrl = typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || "";

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const uid = session!.user.id;
      Promise.all([
        supabase.from("family_members").select("*").eq("user_id", uid),
        supabase.from("emergency_cards").select("*, family_members(full_name, relation, blood_group, allergies, chronic_conditions, current_medications, emergency_contact_name, emergency_contact_phone, date_of_birth)").eq("user_id", uid),
      ]).then(([{ data: m }, { data: c }]) => {
        setMembers(m || []);
        setCards((c || []) as EmergencyCard[]);
        if (m && m.length > 0) setSelectedMember(m[0].id);
      });
    });
  }, []);

  async function handleCreate() {
    if (!selectedMember) { toast.error("Select a family member"); return; }
    setCreating(true);
    const { data: { session } } = await supabase.auth.getSession();
    const { data, error } = await supabase.from("emergency_cards").insert({
      user_id: session!.user.id,
      family_member_id: selectedMember,
      share_id: nanoid(12),
      visible_fields: fields,
      is_active: true,
    }).select("*, family_members(full_name, relation, blood_group, allergies, chronic_conditions, current_medications, emergency_contact_name, emergency_contact_phone, date_of_birth)").single();
    setCreating(false);
    if (error) toast.error(error.message);
    else {
      setCards((c) => [...c, data as EmergencyCard]);
      toast.success("Emergency card created!");
    }
  }

  async function toggleCard(cardId: string, isActive: boolean) {
    await supabase.from("emergency_cards").update({ is_active: !isActive }).eq("id", cardId);
    setCards((c) => c.map((card) => card.id === cardId ? { ...card, is_active: !isActive } : card));
    toast.success(isActive ? "Card deactivated" : "Card activated");
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Emergency Cards</h1>
        <p className="text-sm text-gray-500 mt-0.5">Share critical health info via QR code — no app needed</p>
      </div>

      {/* Create new */}
      <div className="card mb-6">
        <h2 className="section-title mb-4">Create Emergency Card</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="label">Family Member</label>
            <select className="input" value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)}>
              {members.map((m) => <option key={m.id} value={m.id}>{m.full_name} ({m.relation})</option>)}
            </select>
          </div>
        </div>
        <div className="mb-4">
          <p className="label mb-2">Visible Fields</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(DEFAULT_FIELDS).map(([key]) => (
              <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-brand-red"
                  checked={fields[key] !== false}
                  onChange={(e) => setFields((f) => ({ ...f, [key]: e.target.checked }))}
                />
                {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </label>
            ))}
          </div>
        </div>
        <button onClick={handleCreate} disabled={creating} className="btn-primary">
          <Plus size={16} /> {creating ? "Creating..." : "Create Emergency Card"}
        </button>
      </div>

      {/* Existing cards */}
      {cards.length === 0 ? (
        <div className="card text-center py-10">
          <QrCode className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No emergency cards yet. Create one above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cards.map((card) => {
            const member = (card as unknown as { family_members?: FamilyMember }).family_members;
            const shareUrl = `${appUrl}/emergency/${card.share_id}`;
            return (
              <div key={card.id} className={`card ${!card.is_active ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-bold text-gray-900">{member?.full_name}</p>
                    <p className="text-sm text-gray-400">{member?.relation}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleCard(card.id, card.is_active)}
                      className={`p-2 rounded-lg transition-colors ${card.is_active ? "bg-green-100 text-green-600 hover:bg-green-200" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}
                      title={card.is_active ? "Deactivate" : "Activate"}
                    >
                      <Power size={14} />
                    </button>
                    <Link href={shareUrl} target="_blank" className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors">
                      <ExternalLink size={14} />
                    </Link>
                  </div>
                </div>

                <div className="flex justify-center mb-4 p-4 bg-white rounded-xl border border-gray-100">
                  <QRCode value={shareUrl} size={140} />
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-1">{card.is_active ? "Active" : "Inactive"}</p>
                  <p className="text-xs font-mono text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg break-all">{shareUrl}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
