"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, FolderOpen } from "lucide-react";
import { formatDate, getRecordTypeColor } from "@/lib/utils";
import { HealthRecord } from "@/types";

const RECORD_TYPES = ["All Types", "Lab Report", "Prescription", "Discharge Summary", "Imaging Report", "Vaccination", "Insurance", "Surgery Record", "Other"];

interface Props {
  records: HealthRecord[];
  members: { id: string; full_name: string }[];
}

export default function VaultClient({ records, members }: Props) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [memberFilter, setMemberFilter] = useState("all");

  const filtered = records.filter((r) => {
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.provider_name?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All Types" || r.record_type === typeFilter;
    const matchMember = memberFilter === "all" || r.family_member_id === memberFilter;
    return matchSearch && matchType && matchMember;
  });

  return (
    <>
      {/* Filters */}
      <div className="card mb-5 flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Search records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input w-auto" value={memberFilter} onChange={(e) => setMemberFilter(e.target.value)}>
          <option value="all">All Members</option>
          {members.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
        </select>
        <select className="input w-auto" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          {RECORD_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <FolderOpen className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            {records.length === 0 ? "No records yet" : "No matching records"}
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            {records.length === 0
              ? "Upload your first medical record to get started."
              : "Try adjusting your search or filters."}
          </p>
          {records.length === 0 && (
            <Link href="/vault/upload" className="btn-primary">Upload First Record</Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <Link key={r.id} href={`/vault/${r.id}`} className="card hover:shadow-md transition-all hover:-translate-y-0.5">
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className={`badge ${getRecordTypeColor(r.record_type)}`}>{r.record_type}</span>
                {r.ai_status === "processed" && (
                  <span className="badge bg-green-100 text-green-700">✓ AI Summary</span>
                )}
                {r.ai_status === "pending" && (
                  <span className="badge bg-amber-100 text-amber-700">AI Pending</span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{r.title}</h3>
              {r.provider_name && <p className="text-sm text-gray-400 truncate">{r.provider_name}</p>}
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-gray-400">{r.record_date ? formatDate(r.record_date) : "Date unknown"}</p>
                {(r as unknown as { family_members?: { full_name: string } }).family_members && (
                  <span className="text-xs text-gray-500">
                    {(r as unknown as { family_members: { full_name: string } }).family_members.full_name}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
