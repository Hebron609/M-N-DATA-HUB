"use client";

import { Store } from "lucide-react";

export default function AdminVendorsPage() {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-3xl font-bold text-[#0a2144]">Vendors</h2>
        <p className="text-[#5f7088] text-sm">
          Vendor management module aligned with Exclusave admin structure.
        </p>
      </div>

      <div className="rounded-3xl border border-[#d6e1f0] bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Store className="h-5 w-5 text-[#0ea5a8]" />
          <p className="text-sm font-bold uppercase tracking-widest text-[#5f7088]">
            Module Status
          </p>
        </div>
        <p className="text-sm text-[#4f647f] leading-7">
          The vendors page is now present in your admin navigation for structure
          parity. Full functionality requires vendor entities and vendor API
          endpoints in this project schema.
        </p>
      </div>
    </div>
  );
}
