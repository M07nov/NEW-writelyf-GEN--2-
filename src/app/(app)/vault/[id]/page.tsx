import { createServerSupabaseClient as createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Trash2, Brain, AlertTriangle, CheckCircle, FileText } from "lucide-react";
import { formatDate, getRecordTypeColor, getAbnormalStatusColor } from "@/lib/utils";
import { HealthRecord, AIRecordSummary, AbnormalValue } from "@/types";
import DeleteRecordButton from "./DeleteRecordButton";

export const dynamic = "force-dynamic";

export default async function RecordDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  const [{ data: record }, { data: summary }] = await Promise.all([
    supabase.from("health_records").select("*, family_members(full_name, relation)").eq("id", params.id).eq("user_id", session!.user.id).single(),
    supabase.from("ai_record_summaries").select("*").eq("record_id", params.id).single(),
  ]);

  if (!record) notFound();

  const r = record as HealthRecord;
  const ai = summary as AIRecordSummary | null;

  // Generate signed URL for file download
  let signedUrl = "";
  if (r.file_url) {
    const { data } = await supabase.storage.from("health-records").createSignedUrl(r.file_url, 3600);
    signedUrl = data?.signedUrl || "";
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/vault" className="btn-ghost"><ArrowLeft size={16} /></Link>
          <div>
            <h1 className="page-title">{r.title}</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {(r as unknown as { family_members?: { full_name: string } }).family_members?.full_name} · {r.record_date ? formatDate(r.record_date) : "Date unknown"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {signedUrl && (
            <a href={signedUrl} download className="btn-secondary">
              <Download size={16} /> Download
            </a>
          )}
          <DeleteRecordButton recordId={r.id} fileUrl={r.file_url} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* File preview */}
          {r.file_type?.includes("image") && signedUrl && (
            <div className="card">
              <h2 className="section-title mb-4">Document Preview</h2>
              <img src={signedUrl} alt={r.title} className="w-full rounded-xl border border-gray-100" />
            </div>
          )}
          {r.file_type?.includes("pdf") && signedUrl && (
            <div className="card">
              <h2 className="section-title mb-4">Document Preview</h2>
              <iframe src={signedUrl} className="w-full h-96 rounded-xl border border-gray-100" />
            </div>
          )}

          {/* AI Summary */}
          {r.ai_status === "pending" && !ai && (
            <div className="card border-l-4 border-amber-400 bg-amber-50">
              <div className="flex items-center gap-3">
                <Brain className="w-6 h-6 text-amber-500 animate-pulse" />
                <div>
                  <p className="font-semibold text-amber-800">AI Analysis in Progress</p>
                  <p className="text-sm text-amber-600">Your report is being analyzed. Refresh in a moment.</p>
                </div>
              </div>
            </div>
          )}

          {ai && (
            <>
              {/* Summary */}
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-5 h-5 text-brand-blue" />
                  <h2 className="section-title">AI Summary</h2>
                </div>
                <p className="text-gray-700 leading-relaxed">{ai.summary}</p>

                {ai.key_findings?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Key Findings</p>
                    <ul className="space-y-1.5">
                      {(ai.key_findings as string[]).map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Abnormal values */}
              {(ai.abnormal_values as AbnormalValue[])?.length > 0 && (
                <div className="card">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <h2 className="section-title">Values to Review</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left py-2 text-xs text-gray-400 font-medium">Test</th>
                          <th className="text-left py-2 text-xs text-gray-400 font-medium">Value</th>
                          <th className="text-left py-2 text-xs text-gray-400 font-medium">Reference Range</th>
                          <th className="text-left py-2 text-xs text-gray-400 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {(ai.abnormal_values as AbnormalValue[]).map((v, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="py-3 font-medium text-gray-800">{v.test_name}</td>
                            <td className="py-3 text-gray-700">{v.value} {v.unit}</td>
                            <td className="py-3 text-gray-500">{v.reference_range}</td>
                            <td className="py-3">
                              <span className={`badge ${getAbnormalStatusColor(v.status)}`}>
                                {v.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 space-y-2">
                    {(ai.abnormal_values as AbnormalValue[]).map((v, i) => (
                      v.explanation && (
                        <div key={i} className={`p-3 rounded-lg text-xs ${getAbnormalStatusColor(v.status)}`}>
                          <strong>{v.test_name}:</strong> {v.explanation}
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Doctor questions */}
              {(ai.doctor_questions as string[])?.length > 0 && (
                <div className="card bg-blue-50 border-blue-100">
                  <h2 className="section-title mb-3 text-blue-900">Questions to Ask Your Doctor</h2>
                  <ul className="space-y-2">
                    {(ai.doctor_questions as string[]).map((q, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-blue-800">
                        <span className="font-bold text-blue-500 mt-0.5">{i + 1}.</span>
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Safety note */}
              <div className="card bg-gray-50 border-gray-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-500">{ai.safety_note || "This is an AI-generated educational summary and not a diagnosis or medical advice. Please consult a registered medical practitioner."}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Metadata sidebar */}
        <div className="space-y-5">
          <div className="card">
            <h2 className="section-title mb-4">Record Details</h2>
            <div className="space-y-3">
              {[
                { label: "Type", value: r.record_type },
                { label: "Date", value: r.record_date ? formatDate(r.record_date) : "—" },
                { label: "Hospital / Lab", value: r.provider_name || "—" },
                { label: "Doctor", value: r.doctor_name || "—" },
                { label: "File", value: r.file_name || "—" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-gray-800">{value}</p>
                </div>
              ))}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Record Type</p>
                <span className={`badge ${getRecordTypeColor(r.record_type)}`}>{r.record_type}</span>
              </div>
            </div>
          </div>

          {r.notes && (
            <div className="card">
              <h2 className="section-title mb-2">Notes</h2>
              <p className="text-sm text-gray-600">{r.notes}</p>
            </div>
          )}

          <Link href={`/doctor-summary?record=${r.id}`} className="card hover:shadow-md transition-shadow flex items-center gap-3 text-brand-red">
            <FileText size={20} />
            <div>
              <p className="font-semibold">Use in Doctor Summary</p>
              <p className="text-xs text-gray-400">Add to next visit</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
