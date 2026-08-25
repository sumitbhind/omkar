"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "@/lib/toast";
import {
  getAnalytics, getAllEnquiriesForExport,
  type AnalyticsData,
} from "@/lib/adminApi";
import {
  Download, FileSpreadsheet, RefreshCw, TrendingUp,
  MessageSquare, BarChart3, Loader2,
} from "lucide-react";

// ── CSV helpers ───────────────────────────────────────────────────────────────

function escapeCell(v: unknown): string {
  const s = String(v ?? "");
  return s.includes(",") || s.includes('"') || s.includes("\n")
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

function buildCSV(rows: unknown[][]): string {
  return "﻿" + rows.map(r => r.map(escapeCell).join(",")).join("\n");
}

function downloadFile(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

function nowLabel() {
  return new Date().toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).replace(/,/g, "").replace(/ /g, "_");
}

// ── Section header for combined CSV ──────────────────────────────────────────
function sectionRows(title: string): unknown[][] {
  return [[], [`=== ${title} ===`], []];
}

// ── Analytic data → CSV rows ──────────────────────────────────────────────────
function summaryRows(d: AnalyticsData): unknown[][] {
  return [
    ["METRIC", "VALUE"],
    ["Generated At", new Date(d.generatedAt).toLocaleString("en-IN")],
    [],
    ["— LEADS OVERVIEW —"],
    ["Leads Today",      d.leads.today],
    ["Leads This Week",  d.leads.week],
    ["Leads This Month", d.leads.month],
    ["All Time Total",   d.leads.total],
    [],
    ["— ENQUIRIES —"],
    ["Total Enquiries",  d.enquiries.total],
    ["Today",            d.enquiries.today],
    ["This Week",        d.enquiries.week],
    ["This Month",       d.enquiries.month],
    ["Status: New",      d.enquiries.byStatus.new],
    ["Status: Read",     d.enquiries.byStatus.read],
    ["Status: Replied",  d.enquiries.byStatus.replied],
    [],
    ["— CONTENT OVERVIEW —"],
    ["Products",        d.content.products],
    ["Categories",      d.content.categories],
    ["Sub-categories",  d.content.groups],
    ["Media Files",     d.content.media],
    ["Blog Posts",      d.content.blogs],
    ["Pricelist Items", d.content.pricelist],
  ];
}

function trendRows(d: AnalyticsData): unknown[][] {
  return [
    ["MONTH", "ENQUIRIES", "TOTAL"],
    ...d.chart.map(r => [r.name, r.enquiries, r.enquiries]),
    [],
    ["TOTAL",
      d.chart.reduce((a, r) => a + r.enquiries, 0),
      d.chart.reduce((a, r) => a + r.enquiries, 0),
    ],
  ];
}

type RawEnquiry = Awaited<ReturnType<typeof getAllEnquiriesForExport>>[number];

// ── Status badge ─────────────────────────────────────────────────────────────
const STATUS_CLS: Record<string, string> = {
  new:     "bg-orange-100 text-orange-700",
  read:    "bg-blue-100 text-blue-700",
  replied: "bg-green-100 text-green-700",
};

function Badge({ s }: { s: string }) {
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_CLS[s] ?? "bg-gray-100 text-gray-500"}`}>
      {s}
    </span>
  );
}

// ── Download button ───────────────────────────────────────────────────────────
function DlBtn({ label, busy, onClick }: { label: string; busy: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#f26b31] text-white rounded-lg hover:bg-[#e05a20] disabled:opacity-50 disabled:cursor-wait transition-colors font-medium"
    >
      {busy
        ? <Loader2 size={12} className="animate-spin" />
        : <Download size={12} />}
      {label}
    </button>
  );
}

function enquiryRows(list: RawEnquiry[]): unknown[][] {
  return [
    ["SR.", "NAME", "EMAIL", "PHONE", "COMPANY", "MESSAGE", "STATUS", "DATE"],
    ...list.map((e, i) => [
      i + 1, e.name, e.email, e.phone, e.company_name,
      e.message, e.status,
      new Date(e.createdAt).toLocaleString("en-IN"),
    ]),
  ];
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const [dlState, setDlState] = useState({
    full: false, summary: false, trend: false, enquiries: false,
  });
  const setBusy = (key: keyof typeof dlState, v: boolean) =>
    setDlState(prev => ({ ...prev, [key]: v }));

  // ── Fetch analytics ────────────────────────────────────────────────────────
  const fetchAnalytics = useCallback(async () => {
    setLoading(true); setError(null);
    try { setAnalytics(await getAnalytics()); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed to load"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  // ── Individual downloads ───────────────────────────────────────────────────
  const dlSummary = async () => {
    if (!analytics) return;
    setBusy("summary", true);
    downloadFile(`RPI_Analytics_Summary_${nowLabel()}.csv`, buildCSV(summaryRows(analytics)));
    setBusy("summary", false);
  };

  const dlTrend = async () => {
    if (!analytics) return;
    setBusy("trend", true);
    downloadFile(`RPI_Monthly_Trend_${nowLabel()}.csv`, buildCSV(trendRows(analytics)));
    setBusy("trend", false);
  };

  const dlEnquiries = async () => {
    setBusy("enquiries", true);
    try {
      const list = await getAllEnquiriesForExport();
      downloadFile(`RPI_Enquiries_${nowLabel()}.csv`, buildCSV(enquiryRows(list)));
    } catch { toast.error("Enquiries fetch nahi ho sake"); }
    finally { setBusy("enquiries", false); }
  };

  // ── Full combined report ───────────────────────────────────────────────────
  const dlFull = async () => {
    if (!analytics) return;
    setBusy("full", true);
    try {
      const enqList = await getAllEnquiriesForExport();
      const rows: unknown[][] = [
        [`RAMDAS POWER INNOVATIONS — FULL REPORT`],
        [`Generated: ${new Date().toLocaleString("en-IN")}`],
        [],
        ...sectionRows("1. ANALYTICS SUMMARY"),
        ...summaryRows(analytics),
        ...sectionRows("2. MONTHLY TREND (LAST 12 MONTHS)"),
        ...trendRows(analytics),
        ...sectionRows("3. ALL ENQUIRIES"),
        ...enquiryRows(enqList),
      ];
      downloadFile(`RPI_Full_Report_${nowLabel()}.csv`, buildCSV(rows));
    } catch { toast.error("Full report generate nahi ho saka"); }
    finally { setBusy("full", false); }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const d = analytics;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Reports</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {d ? `Data as of ${new Date(d.generatedAt).toLocaleString("en-IN")}` : "Loading…"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600 font-medium"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <DlBtn label="Download Full Report" busy={dlState.full || loading} onClick={dlFull} />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      {/* ── Section 1: Analytics Summary ────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
            <BarChart3 size={15} className="text-[#f26b31]" /> Analytics Summary
          </h3>
          <DlBtn label="Download CSV" busy={dlState.summary || loading} onClick={dlSummary} />
        </div>

        {loading ? (
          <div className="px-5 py-10 text-center text-sm text-gray-300 animate-pulse">Loading…</div>
        ) : d ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-50">
            {/* Leads */}
            <div className="p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Lead Overview</p>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-50">
                  {[
                    ["Today",      d.leads.today],
                    ["This Week",  d.leads.week],
                    ["This Month", d.leads.month],
                    ["All Time",   d.leads.total],
                  ].map(([k, v]) => (
                    <tr key={String(k)}>
                      <td className="py-1.5 text-gray-500">{k}</td>
                      <td className="py-1.5 text-right font-bold text-gray-800">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Enquiries */}
            <div className="p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Enquiries</p>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-50">
                  {[
                    ["Total",   d.enquiries.total],
                    ["New",     d.enquiries.byStatus.new],
                    ["Read",    d.enquiries.byStatus.read],
                    ["Replied", d.enquiries.byStatus.replied],
                  ].map(([k, v]) => (
                    <tr key={String(k)}>
                      <td className="py-1.5 text-gray-500">{k}</td>
                      <td className="py-1.5 text-right font-bold text-gray-800">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Content Overview */}
            <div className="p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Content Overview</p>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-50">
                  {[
                    ["Products",      d.content.products],
                    ["Media Files",   d.content.media],
                    ["Blog Posts",    d.content.blogs],
                  ].map(([k, v]) => (
                    <tr key={String(k)}>
                      <td className="py-1.5 text-gray-500">{k}</td>
                      <td className="py-1.5 text-right font-bold text-gray-800">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>

      {/* ── Section 2: Monthly Trend ─────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
            <TrendingUp size={15} className="text-blue-500" /> Monthly Trend — Last 12 Months
          </h3>
          <DlBtn label="Download CSV" busy={dlState.trend || loading} onClick={dlTrend} />
        </div>

        {loading ? (
          <div className="px-5 py-10 text-center text-sm text-gray-300 animate-pulse">Loading…</div>
        ) : d ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-5 py-3 text-left font-semibold">Month</th>
                  <th className="px-5 py-3 text-right font-semibold">Enquiries</th>
                  <th className="px-5 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {d.chart.map(row => (
                  <tr key={row.name} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-2.5 font-medium text-gray-700">{row.name}</td>
                    <td className="px-5 py-2.5 text-right text-gray-600">{row.enquiries}</td>
                    <td className="px-5 py-2.5 text-right font-bold text-gray-800">{row.enquiries}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-bold text-gray-800">
                  <td className="px-5 py-3">Total</td>
                  <td className="px-5 py-3 text-right">{d.chart.reduce((a, r) => a + r.enquiries, 0)}</td>
                  <td className="px-5 py-3 text-right">{d.chart.reduce((a, r) => a + r.enquiries, 0)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : null}
      </div>

      {/* ── Section 3: Enquiries ────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
            <MessageSquare size={15} className="text-orange-500" /> All Enquiries
          </h3>
          <DlBtn label="Download CSV" busy={dlState.enquiries} onClick={dlEnquiries} />
        </div>
        <p className="px-5 py-2 text-xs text-gray-400 bg-gray-50 border-b border-gray-50">
          {loading ? "Loading…" : `${d?.enquiries.total ?? 0} total enquiries — preview shows latest 8`}
        </p>
        {loading ? (
          <div className="px-5 py-8 text-center text-sm text-gray-300 animate-pulse">Loading…</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {(d?.recentLeads ?? []).filter(r => r.type === "enquiry").slice(0, 8).map(r => (
              <div key={r._id} className="px-5 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 text-xs font-bold">
                  {r.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{r.name}</p>
                  <p className="text-xs text-gray-500 truncate">{r.company || r.email}</p>
                </div>
                <Badge s={r.status} />
              </div>
            ))}
            {(d?.recentLeads ?? []).filter(r => r.type === "enquiry").length === 0 && (
              <p className="px-5 py-6 text-center text-sm text-gray-400">No enquiries yet</p>
            )}
          </div>
        )}
      </div>

      {/* ── Download all CTA ─────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#f26b31]/10 to-indigo-50 rounded-xl border border-[#f26b31]/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-[#f26b31]" />
            Download Complete Report
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Summary + Monthly Trend + All Enquiries — combined in one Excel-ready CSV file
          </p>
        </div>
        <button
          onClick={dlFull}
          disabled={dlState.full || loading}
          className="shrink-0 flex items-center gap-2 px-6 py-2.5 bg-[#f26b31] text-white font-semibold rounded-lg hover:bg-[#e05a20] disabled:opacity-50 disabled:cursor-wait transition-colors text-sm"
        >
          {dlState.full
            ? <><Loader2 size={15} className="animate-spin" /> Generating…</>
            : <><Download size={15} /> Download Full Report</>}
        </button>
      </div>

    </div>
  );
}
