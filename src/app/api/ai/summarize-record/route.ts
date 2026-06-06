import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are a medical document summarization assistant for Indian users.
You do not diagnose, prescribe, or replace a doctor.
Summarize the uploaded health record in simple language.
Extract abnormal values only when reference ranges are visible.
Use cautious language: "may", "could", "requires medical review".
Always recommend consulting a registered medical practitioner.
Return valid JSON only with this exact structure:
{
  "summary": "string",
  "key_findings": ["string"],
  "abnormal_values": [{"test_name": "string", "value": "string", "unit": "string", "reference_range": "string", "status": "high|low|normal|unknown", "explanation": "string"}],
  "doctor_questions": ["string"],
  "safety_note": "string"
}`;

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
    const { recordId, extractedText, recordType } = await req.json();
    if (!recordId) return NextResponse.json({ error: "recordId required" }, { status: 400 });

    const supabase = makeSupabase();
    const { data: record } = await supabase.from("health_records").select("*").eq("id", recordId).single();
    if (!record) return NextResponse.json({ error: "Record not found" }, { status: 404 });

    const context = extractedText
      ? `Record Type: ${recordType || record.record_type}\n\nDocument Content:\n${extractedText}`
      : `Record Type: ${record.record_type}\nTitle: ${record.title}\nProvider: ${record.provider_name || "Unknown"}\nDoctor: ${record.doctor_name || "Unknown"}\nDate: ${record.record_date || "Unknown"}\nNotes: ${record.notes || "None"}\n\nNote: Full document text not available. Generate a general educational summary based on record type.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: context },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500,
    });

    const aiOutput = JSON.parse(response.choices[0].message.content || "{}");

    await supabase.from("ai_record_summaries").upsert({
      user_id: record.user_id,
      record_id: recordId,
      summary: aiOutput.summary || "",
      key_findings: aiOutput.key_findings || [],
      abnormal_values: aiOutput.abnormal_values || [],
      doctor_questions: aiOutput.doctor_questions || [],
      safety_note: aiOutput.safety_note || "This is an AI-generated educational summary and not a diagnosis or medical advice. Please consult a registered medical practitioner.",
      raw_ai_output: aiOutput,
    }, { onConflict: "record_id" });

    await supabase.from("health_records").update({ ai_status: "processed" }).eq("id", recordId);

    await supabase.from("timeline_events").insert({
      user_id: record.user_id,
      family_member_id: record.family_member_id,
      record_id: recordId,
      event_type: "ai_summary",
      title: `AI analyzed ${record.record_type}`,
      description: aiOutput.summary?.slice(0, 120) || "AI summary generated",
      event_date: record.record_date || new Date().toISOString().split("T")[0],
    });

    return NextResponse.json({ success: true, summary: aiOutput });
  } catch (err: unknown) {
    console.error("AI summarize error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
