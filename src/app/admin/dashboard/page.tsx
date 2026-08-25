"use client";

import { useEffect, useState } from "react";
import { getDashboardStats, getEnquiries } from "@/lib/adminApi";
import { Package, MessageSquare, FolderOpen, Layers, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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

interface Stats {
  totalProducts: number;
  totalCategories: number;
  totalGroups: number;
  totalEnquiries: number;
  newEnquiries: number;
  graph: { name: string; leads: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-orange-100 text-orange-700",
  read: "bg-blue-100 text-blue-700",
  replied: "bg-green-100 text-green-700",
};

const STATUS_BORDER: Record<string, string> = {
  new: "border-l-orange-400",
  read: "border-l-blue-400",
  replied: "border-l-green-400",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, enq] = await Promise.all([
          getDashboardStats(),
          getEnquiries(1),
        ]);
        setStats(s);
        setRecent((enq.data ?? []).slice(0, 5));
      } catch {
        // stats will remain null
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const cards = [
    {
      label: "Total Products",
      value: stats?.totalProducts ?? 0,
      icon: Package,
      gradient: "from-blue-500 to-blue-600",
      href: "/admin/products/list",
    },
    {
      label: "Categories",
      value: stats?.totalCategories ?? 0,
      icon: FolderOpen,
      gradient: "from-purple-500 to-purple-600",
      href: "/admin/products/categories",
    },
    {
      label: "Sub Categories",
      value: stats?.totalGroups ?? 0,
      icon: Layers,
      gradient: "from-indigo-500 to-indigo-600",
      href: "/admin/products/sub-categories",
    },
    {
      label: "Total Enquiries",
      value: stats?.totalEnquiries ?? 0,
      icon: MessageSquare,
      gradient: "from-emerald-500 to-emerald-600",
      href: "/admin/leads/enquiries",
    },
    {
      label: "New Enquiries",
      value: stats?.newEnquiries ?? 0,
      icon: Clock,
      gradient: "from-orange-500 to-[#f26b31]",
      href: "/admin/leads/enquiries",
    },
    {
      label: "Monthly Trend",
      value: stats?.graph?.reduce((a, b) => a + b.leads, 0) ?? 0,
      icon: TrendingUp,
      gradient: "from-rose-500 to-rose-600",
      href: "/admin/leads/enquiries",
    },
  ];

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[#f26b31] font-semibold uppercase tracking-wider mb-0.5">Overview</p>
          <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
        </div>
        <span className="text-xs text-gray-400 bg-white border border-gray-100 px-3 py-1.5 rounded-lg shadow-sm">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </span>
      </div>

      {/* Gradient stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map(({ label, value, icon: Icon, gradient, href }) => (
          <Link
            key={label}
            href={href}
            className={`bg-gradient-to-br ${gradient} rounded-xl p-5 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden relative group`}
          >
            {/* Decorative circles */}
            <div className="absolute -right-3 -top-3 w-16 h-16 rounded-full bg-white/10 group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute -right-1 -bottom-5 w-12 h-12 rounded-full bg-white/5" />

            <div className="relative">
              <div className="mb-4">
                <Icon size={22} className="text-white/90" />
              </div>
              <p className="text-3xl font-bold text-white mb-1 leading-none">
                {loading ? <span className="opacity-40">—</span> : value}
              </p>
              <p className="text-[11px] text-white/75 font-medium uppercase tracking-wide leading-tight">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Monthly Leads Graph */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 pt-4 pb-4 border-b border-gray-50 bg-gradient-to-r from-orange-50/60 to-white flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">Monthly Leads</h3>
            <p className="text-xs text-gray-400 mt-0.5">Last 6 months enquiry trend</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-white border border-gray-100 px-3 py-1.5 rounded-lg shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f26b31] inline-block" />
            Enquiries
          </div>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="h-48 flex items-center justify-center text-gray-300 text-sm animate-pulse">
              Loading graph…
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stats?.graph ?? []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f26b31" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f26b31" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                  labelStyle={{ fontWeight: 600, color: "#374151" }}
                />
                <Area
                  type="monotone"
                  dataKey="leads"
                  stroke="#f26b31"
                  strokeWidth={2.5}
                  fill="url(#leadGrad)"
                  dot={{ r: 4, fill: "#f26b31", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Enquiries */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 bg-gradient-to-r from-gray-50/80 to-white">
          <h3 className="font-semibold text-gray-800 text-sm">Recent Enquiries</h3>
          <Link
            href="/admin/leads/enquiries"
            className="text-xs text-[#f26b31] hover:underline font-medium"
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="px-5 py-10 text-center text-sm text-gray-300 animate-pulse">Loading…</div>
        ) : recent.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-gray-400">No enquiries yet</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recent.map((enq) => (
              <div
                key={enq._id}
                className={`pl-4 pr-5 py-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors border-l-4 ${STATUS_BORDER[enq.status]}`}
              >
                <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center shrink-0 text-orange-600 font-bold text-sm">
                  {enq.name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{enq.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {enq.company_name} &middot; {enq.phone}
                  </p>
                </div>

                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize shrink-0 ${STATUS_COLORS[enq.status]}`}>
                  {enq.status}
                </span>

                <p className="text-xs text-gray-400 shrink-0 hidden sm:block">
                  {new Date(enq.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
