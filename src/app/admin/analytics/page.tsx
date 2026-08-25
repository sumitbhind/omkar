"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getAnalytics, type AnalyticsData } from "@/lib/adminApi";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  MessageSquare, FileText, Package, FolderOpen, Layers,
  Image as ImageIcon, BookOpen, Users, List, RefreshCw,
  TrendingUp, Calendar, CalendarDays, Infinity,
  Clock, CheckCircle, Eye, Send, AlertCircle,
} from "lucide-react";

const REFRESH_INTERVAL = 30; // seconds

// ── Small helpers ────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)  return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString("en-IN");
}

// ── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon: Icon, accent, loading,
}: {
  label: string; value: number | string; sub: string;
  icon: React.ElementType; accent: string; loading: boolean;
}) {
  return (
    <div className={`bg-gradient-to-br ${accent} rounded-xl shadow-md p-5 flex flex-col gap-3 overflow-hidden relative`}>
      <div className="absolute -right-3 -top-3 w-16 h-16 rounded-full bg-white/10" />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold text-white/75 uppercase tracking-wide">{label}</span>
          <Icon size={18} className="text-white/80" />
        </div>
        <p className={`text-3xl font-bold text-white ${loading ? "opacity-40" : ""}`}>
          {loading ? "—" : fmt(Number(value))}
        </p>
        <p className="text-xs text-white/60 mt-1">{sub}</p>
      </div>
    </div>
  );
}

// ── Status Bar ───────────────────────────────────────────────────────────────

function StatusBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-14 shrink-0 capitalize">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div className={`h-2 rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-700 w-8 text-right">{count}</span>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [data, setData]       = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
  const [spinning, setSpinning]   = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async (manual = false) => {
    if (manual) setSpinning(true);
    setError(null);
    try {
      const result = await getAnalytics();
      setData(result);
      setCountdown(REFRESH_INTERVAL);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load analytics");
    } finally {
      setLoading(false);
      if (manual) setTimeout(() => setSpinning(false), 600);
    }
  }, []);

  // Initial load
  useEffect(() => { fetchData(); }, [fetchData]);

  // 30-second auto-refresh + countdown ticker
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { fetchData(); return REFRESH_INTERVAL; }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [fetchData]);

  // ── Derived ─────────────────────────────────────────────────────────────────

  const enqTotal   = data?.enquiries.total ?? 0;
  const qtoTotal   = data?.quotes.total ?? 0;
  const enqStatus  = data?.enquiries.byStatus ?? { new: 0, read: 0, replied: 0 };
  const qtoStatus  = data?.quotes.byStatus    ?? { new: 0, read: 0, quoted: 0, closed: 0 };
  const content    = data?.content ?? { products:0, categories:0, groups:0, media:0, blogs:0, subscribers:0, pricelist:0 };

  const contentItems = [
    { label: "Products",       value: content.products,    icon: Package,    color: "bg-blue-500" },
    { label: "Categories",     value: content.categories,  icon: FolderOpen, color: "bg-purple-500" },
    { label: "Sub-categories", value: content.groups,      icon: Layers,     color: "bg-indigo-500" },
    { label: "Media Files",    value: content.media,       icon: ImageIcon,  color: "bg-pink-500" },
    { label: "Blog Posts",     value: content.blogs,       icon: BookOpen,   color: "bg-teal-500" },
    { label: "Subscribers",    value: content.subscribers, icon: Users,      color: "bg-cyan-500" },
    { label: "Pricelist",      value: content.pricelist,   icon: List,       color: "bg-amber-500" },
  ];

  const statusIconMap: Record<string, React.ElementType> = {
    new: AlertCircle, read: Eye, replied: Send, quoted: CheckCircle, closed: CheckCircle,
  };
  const statusColorMap: Record<string, string> = {
    new: "text-orange-500", read: "text-blue-500", replied: "text-green-500",
    quoted: "text-purple-500", closed: "text-gray-400",
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-[#f26b31] font-semibold uppercase tracking-wider mb-0.5">Real-time</p>
          <h2 className="text-xl font-bold text-gray-800">Analytics Dashboard</h2>
          {data && (
            <p className="text-xs text-gray-400 mt-0.5">
              Last updated: {new Date(data.generatedAt).toLocaleTimeString("en-IN")}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Countdown */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Clock size={12} />
            <span>Refresh in <span className="font-semibold text-gray-600">{countdown}s</span></span>
          </div>

          {/* Manual refresh */}
          <button
            onClick={() => fetchData(true)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600 font-medium"
          >
            <RefreshCw size={12} className={spinning ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Error banner ───────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* ── Top stat cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Leads Today"      value={data?.leads.today ?? 0}  sub="Enquiries + Quotes"   icon={Calendar}     accent="from-orange-500 to-[#f26b31]" loading={loading} />
        <StatCard label="This Week"        value={data?.leads.week  ?? 0}  sub="Last 7 days"          icon={CalendarDays} accent="from-blue-500 to-blue-600"    loading={loading} />
        <StatCard label="This Month"       value={data?.leads.month ?? 0}  sub={new Date().toLocaleString("en-IN",{month:"long"})} icon={TrendingUp} accent="from-purple-500 to-purple-600" loading={loading} />
        <StatCard label="All Time Leads"   value={data?.leads.total ?? 0}  sub="Total received"       icon={Infinity}     accent="from-emerald-500 to-emerald-600" loading={loading} />
      </div>

      {/* ── Chart ──────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 pt-4 pb-4 border-b border-gray-50 bg-gradient-to-r from-orange-50/60 to-white flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">Monthly Lead Trend</h3>
            <p className="text-xs text-gray-400 mt-0.5">Enquiries vs Quote Requests — last 12 months</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500 bg-white border border-gray-100 px-3 py-1.5 rounded-lg shadow-sm">
            <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-[#f26b31] inline-block" /> Enquiries</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-[#6366f1] inline-block" /> Quotes</span>
          </div>
        </div>
        <div className="p-5">

        {loading ? (
          <div className="h-56 flex items-center justify-center text-gray-300 text-sm animate-pulse">Loading chart…</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.chart ?? []} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                cursor={{ fill: "#f9fafb" }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              <Bar dataKey="enquiries" name="Enquiries" fill="#f26b31" radius={[4,4,0,0]} />
              <Bar dataKey="quotes"    name="Quotes"    fill="#6366f1" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
        </div>
      </div>

      {/* ── Status + Recent Activity ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Enquiry Status */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
              <MessageSquare size={15} className="text-orange-500" /> Enquiries
            </h3>
            <span className="text-xs font-bold text-gray-600 bg-orange-50 px-2 py-0.5 rounded-full">{enqTotal} total</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {(["new","read","replied"] as const).map(s => {
              const Icon = statusIconMap[s];
              return (
                <div key={s} className="bg-gray-50 rounded-lg p-3 text-center">
                  <Icon size={14} className={`mx-auto mb-1 ${statusColorMap[s]}`} />
                  <p className="text-lg font-bold text-gray-800">{loading ? "—" : enqStatus[s]}</p>
                  <p className="text-[10px] text-gray-500 capitalize">{s}</p>
                </div>
              );
            })}
          </div>

          <div className="space-y-2.5 pt-1">
            <StatusBar label="New"     count={enqStatus.new}     total={enqTotal} color="bg-orange-400" />
            <StatusBar label="Read"    count={enqStatus.read}    total={enqTotal} color="bg-blue-400" />
            <StatusBar label="Replied" count={enqStatus.replied} total={enqTotal} color="bg-green-400" />
          </div>

          <div className="border-t pt-3 grid grid-cols-3 text-center text-xs text-gray-500">
            <div><p className="font-bold text-gray-700">{loading?"—":data?.enquiries.today}</p><p>Today</p></div>
            <div><p className="font-bold text-gray-700">{loading?"—":data?.enquiries.week}</p><p>This Week</p></div>
            <div><p className="font-bold text-gray-700">{loading?"—":data?.enquiries.month}</p><p>This Month</p></div>
          </div>
        </div>

        {/* Quote Status */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
              <FileText size={15} className="text-indigo-500" /> Quote Requests
            </h3>
            <span className="text-xs font-bold text-gray-600 bg-indigo-50 px-2 py-0.5 rounded-full">{qtoTotal} total</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {(["new","read","quoted","closed"] as const).map(s => {
              const Icon = statusIconMap[s];
              return (
                <div key={s} className="bg-gray-50 rounded-lg p-2 text-center">
                  <Icon size={13} className={`mx-auto mb-1 ${statusColorMap[s]}`} />
                  <p className="text-base font-bold text-gray-800">{loading ? "—" : qtoStatus[s]}</p>
                  <p className="text-[10px] text-gray-500 capitalize">{s}</p>
                </div>
              );
            })}
          </div>

          <div className="space-y-2.5 pt-1">
            <StatusBar label="New"    count={qtoStatus.new}    total={qtoTotal} color="bg-orange-400" />
            <StatusBar label="Read"   count={qtoStatus.read}   total={qtoTotal} color="bg-blue-400" />
            <StatusBar label="Quoted" count={qtoStatus.quoted} total={qtoTotal} color="bg-purple-400" />
            <StatusBar label="Closed" count={qtoStatus.closed} total={qtoTotal} color="bg-gray-300" />
          </div>

          <div className="border-t pt-3 grid grid-cols-3 text-center text-xs text-gray-500">
            <div><p className="font-bold text-gray-700">{loading?"—":data?.quotes.today}</p><p>Today</p></div>
            <div><p className="font-bold text-gray-700">{loading?"—":data?.quotes.week}</p><p>This Week</p></div>
            <div><p className="font-bold text-gray-700">{loading?"—":data?.quotes.month}</p><p>This Month</p></div>
          </div>
        </div>
      </div>

      {/* ── Content + Recent Activity ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Content Overview */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 text-sm mb-4">Content Overview</h3>
          <div className="grid grid-cols-2 gap-3">
            {contentItems.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                  <Icon size={14} className="text-white" />
                </div>
                <div>
                  <p className={`text-lg font-bold text-gray-800 leading-none ${loading ? "animate-pulse text-gray-200" : ""}`}>
                    {loading ? "—" : value}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h3 className="font-semibold text-gray-800 text-sm">Recent Activity</h3>
            <p className="text-xs text-gray-400 mt-0.5">Latest enquiries &amp; quotes combined</p>
          </div>

          {loading ? (
            <div className="px-5 py-10 text-center text-sm text-gray-300 animate-pulse">Loading…</div>
          ) : (data?.recentLeads ?? []).length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-400">No leads yet</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {(data?.recentLeads ?? []).map(lead => (
                <div key={`${lead.type}-${lead._id}`} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${lead.type === "enquiry" ? "bg-orange-100 text-orange-600" : "bg-indigo-100 text-indigo-600"}`}>
                    {lead.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{lead.name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{lead.company || lead.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${lead.type === "enquiry" ? "bg-orange-50 text-orange-600" : "bg-indigo-50 text-indigo-600"}`}>
                      {lead.type}
                    </span>
                    <span className="text-[10px] text-gray-400">{timeAgo(lead.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
