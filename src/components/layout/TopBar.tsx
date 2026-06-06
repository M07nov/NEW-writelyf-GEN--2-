"use client";

import Link from "next/link";
import { Upload, Plus } from "lucide-react";

interface TopBarProps {
  title: string;
  subtitle?: string;
  action?: { label: string; href: string; icon?: "upload" | "plus" };
}

export default function TopBar({ title, subtitle, action }: TopBarProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && (
        <Link href={action.href} className="btn-primary">
          {action.icon === "upload" ? (
            <Upload size={16} />
          ) : (
            <Plus size={16} />
          )}
          {action.label}
        </Link>
      )}
    </div>
  );
}
