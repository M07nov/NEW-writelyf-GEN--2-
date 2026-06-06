"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, Upload, Brain, FileText } from "lucide-react";
import { format, parseISO } from "date-fns";
import { TimelineEvent } from "@/types";

const EVENT_ICONS: Record<string, React.ReactNode> = {
  record_uploaded: <Upload size={14} className="text-blue-500" />,
  ai_summary: <Brain size={14} className="text-purple-500" />,
  doctor_visit: <FileText size={14} className="text-green-500" />,
};

const EVENT_COLORS: Record<string, string> = {
  record_uploaded: "bg-blue-100",
  ai_summary: "bg-purple-100",
  doctor_visit: "bg-green-100",
};

interface Props {
  events: TimelineEvent[];
  members: { id: string; full_name: string }[];
}

export default function TimelineClient({ events, members }: Props) {
  const [memberFilter, setMemberFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = events.filter((e) => {
    const matchMember = memberFilter === "all" || e.family_member_id === memberFilter;
    const matchType = typeFilter === "all" || e.event_type === typeFilter;
    return matchMember && matchType;
  });

  // Group by month
  const grouped: Record<string, TimelineEvent[]> = {};
  filtered.forEach((e) => {
    const key = e.event_date ? format(parseISO(e.event_date), "MMMM yyyy") : "Unknown Date";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(e);
  });

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select className="input w-auto" value={memberFilter} onChange={(e) => setMemberFilter(e.target.value)}>
          <option value="all">All Members</option>
          {members.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
        </select>
        <select className="input w-auto" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">All Events</option>
          <option value="record_uploaded">Records Uploaded</option>
          <option value="ai_summary">AI Summaries</option>
          <option value="doctor_visit">Doctor Visits</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <Clock className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">No timeline events</h2>
          <p className="text-gray-400 text-sm">Upload health records to build your timeline.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([month, evts]) => (
            <div key={month}>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">{month}</h2>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-100" />
                <div className="space-y-4 pl-12">
                  {evts.map((e) => (
                    <div key={e.id} className="relative">
                      <div className={`absolute -left-8 w-7 h-7 rounded-full flex items-center justify-center ${EVENT_COLORS[e.event_type] || "bg-gray-100"}`}>
                        {EVENT_ICONS[e.event_type] || <Clock size={14} className="text-gray-400" />}
                      </div>
                      <div className="card hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-gray-800">{e.title}</p>
                            {e.description && <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{e.description}</p>}
                            {(e as unknown as { family_members?: { full_name: string } }).family_members && (
                              <p className="text-xs text-gray-400 mt-1">
                                {(e as unknown as { family_members: { full_name: string } }).family_members.full_name}
                              </p>
                            )}
                          </div>
                          {e.record_id && (
                            <Link href={`/vault/${e.record_id}`} className="text-xs text-brand-red hover:underline whitespace-nowrap">
                              View record →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
