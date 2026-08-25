"use client";

import { useEffect, useState, useCallback } from "react";
import { getEnquiries, updateEnquiryStatus } from "@/lib/adminApi";
import { ChevronLeft, ChevronRight, Mail, Phone, Building2 } from "lucide-react";

interface Enquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company_name: string;
  message: string;
  status: "new" | "read" | "replied";
  createdAt: string;
}

const STATUS_COLOR: Record<string, string> = {
  new:     "bg-orange-100 text-orange-700",
  read:    "bg-blue-100 text-blue-700",
  replied: "bg-green-100 text-green-700",
};

export default function EnquiriesPage() {
  const [enquiries,  setEnquiries]  = useState<Enquiry[]>([]);
  const [page,       setPage]       = useState(1);
  const [total,      setTotal]      = useState(0);
  const [pages,      setPages]      = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading,    setLoading]    = useState(true);
  const [expanded,   setExpanded]   = useState<string | null>(null);
  const [updating,   setUpdating]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getEnquiries(page, statusFilter || undefined);
      setEnquiries(r.data ?? []);
      setTotal(r.total ?? 0);
      setPages(r.pages ?? 1);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const r = await updateEnquiryStatus(id, status);
      setEnquiries((prev) => prev.map((e) => e._id === id ? r.data : e));
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-800 font-outfit">
          Enquiries <span className="text-sm text-gray-400 font-normal">({total} total)</span>
        </h2>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]"
        >
          <option value="">All</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">Loading…</div>
        ) : enquiries.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">No enquiries found</div>
        ) : (
          <div className="divide-y">
            {enquiries.map((enq) => (
              <div key={enq._id} className="p-4 sm:p-5">
                {/* Row */}
                <div
                  className="flex items-start gap-3 cursor-pointer"
                  onClick={() => setExpanded((prev) => prev === enq._id ? null : enq._id)}
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center shrink-0 text-orange-600 font-bold text-sm">
                    {enq.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-800 text-sm">{enq.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[enq.status]}`}>
                        {enq.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 mt-0.5 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Building2 size={11} />{enq.company_name}</span>
                      <span className="flex items-center gap-1"><Phone size={11} />{enq.phone}</span>
                      <span className="flex items-center gap-1"><Mail size={11} />{enq.email}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 shrink-0">
                    {new Date(enq.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>

                {/* Expanded detail */}
                {expanded === enq._id && (
                  <div className="mt-3 ml-12 space-y-3">
                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 leading-relaxed">
                      {enq.message}
                    </div>
                    {/* Status actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-500">Mark as:</span>
                      {(["new", "read", "replied"] as const).map((s) => (
                        <button
                          key={s}
                          disabled={enq.status === s || updating === enq._id}
                          onClick={() => handleStatus(enq._id, s)}
                          className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors
                            ${enq.status === s
                              ? `${STATUS_COLOR[s]} border-transparent cursor-default`
                              : "border-gray-200 text-gray-600 hover:border-[#f26b31] hover:text-[#f26b31]"}
                            disabled:opacity-50`}
                        >
                          {s}
                        </button>
                      ))}
                      <a
                        href={`mailto:${enq.email}?subject=Re: Your Enquiry - Ramdas Power Innovations`}
                        className="ml-auto text-xs text-[#f26b31] hover:underline"
                      >
                        Reply via Email →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-3 py-4 border-t">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-[#f26b31] hover:text-[#f26b31] disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-gray-600">Page {page} of {pages}</span>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-[#f26b31] hover:text-[#f26b31] disabled:opacity-40 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
