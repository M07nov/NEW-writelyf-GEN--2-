import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Heart, AlertTriangle, Phone } from "lucide-react";
import { FamilyMember } from "@/types";

export const dynamic = "force-dynamic";

export default async function EmergencyPublicPage({ params }: { params: { shareId: string } }) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: card } = await supabase
    .from("emergency_cards")
    .select("*, family_members(*)")
    .eq("share_id", params.shareId)
    .eq("is_active", true)
    .single();

  if (!card) notFound();

  const member: FamilyMember = (card as unknown as { family_members: FamilyMember }).family_members;
  const fields: Record<string, boolean> = card.visible_fields || {};

  const age = member.date_of_birth
    ? Math.floor((Date.now() - new Date(member.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365))
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <div className="bg-brand-red text-white px-6 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <AlertTriangle className="w-6 h-6" />
          <div>
            <p className="font-bold text-lg">EMERGENCY HEALTH CARD</p>
            <p className="text-red-200 text-sm">Writelyf HealthOS</p>
          </div>
          <Heart className="w-5 h-5 ml-auto" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-4">
        {fields.name !== false && (
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6 text-center">
            <p className="text-sm text-gray-400 mb-1">Patient</p>
            <h1 className="text-3xl font-bold text-gray-900">{member.full_name}</h1>
            {age && <p className="text-gray-500 mt-1">{age} years old · {member.gender}</p>}
          </div>
        )}

        {fields.blood_group !== false && member.blood_group && (
          <div className="bg-brand-red text-white rounded-2xl p-6 text-center">
            <p className="text-red-200 text-sm mb-1">Blood Group</p>
            <p className="text-6xl font-black">{member.blood_group}</p>
          </div>
        )}

        {fields.allergies !== false && member.allergies?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-amber-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-amber-500" />
              <p className="font-bold text-amber-800">ALLERGIES</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {member.allergies.map((a) => (
                <span key={a} className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full font-semibold text-sm">{a}</span>
              ))}
            </div>
          </div>
        )}

        {fields.chronic_conditions !== false && member.chronic_conditions?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="font-bold text-gray-700 mb-3">Chronic Conditions</p>
            <div className="flex flex-wrap gap-2">
              {member.chronic_conditions.map((c) => (
                <span key={c} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">{c}</span>
              ))}
            </div>
          </div>
        )}

        {fields.current_medications !== false && member.current_medications?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="font-bold text-gray-700 mb-3">Current Medications</p>
            <ul className="space-y-1">
              {member.current_medications.map((m) => (
                <li key={m} className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0" />
                  {m}
                </li>
              ))}
            </ul>
          </div>
        )}

        {fields.emergency_contact !== false && member.emergency_contact_name && (
          <div className="bg-green-50 rounded-2xl border border-green-200 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Phone size={18} className="text-green-600" />
              <p className="font-bold text-green-800">Emergency Contact</p>
            </div>
            <p className="text-gray-800 font-semibold">{member.emergency_contact_name}</p>
            <a href={`tel:${member.emergency_contact_phone}`} className="text-green-700 text-lg font-bold hover:underline mt-1 block">
              {member.emergency_contact_phone}
            </a>
          </div>
        )}

        {fields.notes !== false && member.notes && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="font-bold text-gray-700 mb-2">Important Notes</p>
            <p className="text-sm text-gray-600">{member.notes}</p>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 pb-4">
          Generated by Writelyf HealthOS · Not a medical document
        </p>
      </div>
    </div>
  );
}
