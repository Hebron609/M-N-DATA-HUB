"use client";

import { ClipboardList } from "lucide-react";

export default function AdminVendorApplicationsPage() {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-3xl font-bold text-[#0a2144]">
          Vendor Applications
        </h2>
        <p className="text-[#5f7088] text-sm">
          Application review module aligned with Exclusave admin structure.
        </p>
      </div>

      <div className="rounded-3xl border border-[#d6e1f0] bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-[#0ea5a8]" />
          <p className="text-sm font-bold uppercase tracking-widest text-[#5f7088]">
            Module Status
          </p>
        </div>
        <p className="text-sm text-[#4f647f] leading-7">
          The vendor applications section is now available in the admin flow.
          Full application approval workflows require vendor application records
          and persistence APIs to be added in this backend.
        </p>
      </div>
    </div>
  );
}
