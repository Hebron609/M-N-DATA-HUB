"use client";

import { Star } from "lucide-react";

export default function AdminReviewsPage() {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-3xl font-bold text-[#0a2144]">Reviews</h2>
        <p className="text-[#5f7088] text-sm">
          Review moderation module aligned with Exclusave admin structure.
        </p>
      </div>

      <div className="rounded-3xl border border-[#d6e1f0] bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Star className="h-5 w-5 text-[#0ea5a8]" />
          <p className="text-sm font-bold uppercase tracking-widest text-[#5f7088]">
            Module Status
          </p>
        </div>
        <p className="text-sm text-[#4f647f] leading-7">
          The reviews page has been added to match your Exclusave admin
          structure. To make this fully functional, the next step is adding a
          dedicated reviews table and review APIs in this codebase.
        </p>
      </div>
    </div>
  );
}
