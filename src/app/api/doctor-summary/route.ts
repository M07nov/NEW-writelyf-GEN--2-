import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function makeSupabase() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { family_member_id, chief_complaint, duration, symptoms, current_medicines, allergies, questions, selected_record_ids, user_id } = body;

    const supabase = makeSupabase();
    const { data: member } = await supabase.from("family_members").select("*").eq("id", family_member_id).single();

    let recordContext = "";
    if (selected_record_ids?.length > 0) {
      const { data: records } = await supabase
        .from("health_records")
        .select("title, record_type, record_date, ai_record_summaries(summary, abnormal_values)")
        .in("id", selected_record_ids);

      if (records) {
        recordContext = records.map((r) => {
          const summary = (r as unknown as { ai_record_summaries?: { summary?: string } }).ai_record_summaries;
          return `- ${r.title} (${r.record_type}, ${r.record_date}): ${summary?.summary || "No AI summary"}`;
        }).join("\n");
      }
    }

    const age = member?.date_of_birth
      ? Math.floor((Date.now() - new Date(member.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365))
      : "Unknown";

    const prompt = `Generate a structured doctor visit summary for an Indian patient.

Patient: ${member?.full_name || "Patient"}
Age/Sex: ${age} years / ${member?.gender || "Unknown"}
Chief Complaint: ${chief_complaint}
Duration: ${duration || "Not specified"}
Symptoms: ${symptoms || "Not specified"}
Past Medical History / Chronic Conditions: ${member?.chronic_conditions?.join(", ") || "None"}
Current Medications: ${current_medicines || member?.current_medications?.join(", ") || "None"}
Allergies: ${allergies || member?.allergies?.join(", ") || "NKDA"}
Relevant Records:\n${recordContext || "None attached"}
Patient Questions: ${questions || "None"}

Generate a clean, professional doctor visit summary. Include clearly labeled sections. Be concise. This is for the patient to bring to their doctor.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a medical documentation assistant. Generate structured, professional doctor visit summaries for Indian patients. Never diagnose or prescribe." },
        { role: "user", content: prompt },
      ],
      max_tokens: 1200,
    });

    const generatedSummary = response.choices[0].message.content || "";

    const { data: saved, error } = await supabase.from("doctor_summaries").insert({
      user_id,
      family_member_id,
      chief_complaint,
      duration,
      symptoms: symptoms ? symptoms.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
      selected_record_ids: selected_record_ids || [],
      current_medicines,
      allergies,
      questions,
      generated_summary: generatedSummary,
    }).select().single();

    if (error) throw error;
    return NextResponse.json({ id: saved.id, summary: generatedSummary });
  } catch (err: unknown) {
    console.error("Doctor summary error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
