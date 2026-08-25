"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { isLoggedIn, removeToken, getMe } from "@/lib/adminApi";
import { toast } from "@/lib/toast";
import {
  LayoutDashboard,
  Package,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Home,
  Info,
  Briefcase,
  FileText,
  DollarSign,
  Users,
  Phone,
  Tag,
  Layers,
  Image as ImageIcon,
  Video,
  File,
  Download,
  Search,
  Map,
  Bot,
  Link2,
  Mail,
  Megaphone,
  Layout,
  BarChart2,
  PieChart,
  Globe,
  Shield,
  BookOpen,
  Newspaper,
  FolderOpen,
  Star,
  Zap,
  ArrowRight,
  Command,
} from "lucide-react";

// ── Sidebar nav structure ────────────────────────────────────────────────────

type NavItem = { label: string; href: string; icon: React.ElementType };
type NavGroup = { section: string; icon: React.ElementType; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    section: "Dashboard",
    icon: LayoutDashboard,
    items: [
      { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart2 },
      { label: "Reports", href: "/admin/reports", icon: PieChart },
    ],
  },
  {
    section: "CMS Management",
    icon: Layout,
    items: [
      { label: "Homepage",     href: "/admin/cms/homepage", icon: Home },
      { label: "Hero Banners", href: "/admin/cms/banners",  icon: ImageIcon },
      { label: "About Us",     href: "/admin/cms/about",    icon: Info },
      { label: "Company Profile", href: "/admin/cms/company-profile", icon: Briefcase },
      { label: "Products Page", href: "/admin/cms/products", icon: Package },
      { label: "Pricelist", href: "/admin/cms/pricelist", icon: DollarSign },
      { label: "Contact Us", href: "/admin/cms/contact", icon: Phone },
    ],
  },
  {
    section: "Product Management",
    icon: Package,
    items: [
      { label: "Categories", href: "/admin/products/categories", icon: FolderOpen },
      { label: "Sub Categories", href: "/admin/products/sub-categories", icon: Layers },
      { label: "Products", href: "/admin/products/list", icon: Package },
      { label: "PDF Catalogues", href: "/admin/products/catalogues", icon: File },
      { label: "Product Images", href: "/admin/products/images", icon: ImageIcon },
    ],
  },
  {
    section: "Lead Management",
    icon: MessageSquare,
    items: [
      { label: "Enquiries", href: "/admin/leads/enquiries", icon: MessageSquare },
    ],
  },
  {
    section: "Blog Management",
    icon: BookOpen,
    items: [
      { label: "Articles", href: "/admin/blogs/articles", icon: BookOpen },
    ],
  },
  {
    section: "Media Manager",
    icon: ImageIcon,
    items: [
      { label: "Images", href: "/admin/media/images", icon: ImageIcon },
      { label: "Videos", href: "/admin/media/videos", icon: Video },
      { label: "PDF Files", href: "/admin/media/pdfs", icon: File },
      { label: "Downloads", href: "/admin/media/downloads", icon: Download },
    ],
  },
  {
    section: "SEO Manager",
    icon: Search,
    items: [
      { label: "Meta Tags", href: "/admin/seo/meta", icon: Tag },
      { label: "Sitemap", href: "/admin/seo/sitemap", icon: Map },
      { label: "Robots.txt", href: "/admin/seo/robots", icon: Bot },
      { label: "URL Redirects", href: "/admin/seo/redirects", icon: Link2 },
    ],
  },
  {
    section: "Marketing Tools",
    icon: Megaphone,
    items: [
      { label: "Popup Management", href: "/admin/marketing/popups", icon: Zap },
    ],
  },
  {
    section: "Settings",
    icon: Settings,
    items: [
      { label: "General Settings", href: "/admin/settings", icon: Settings },
      { label: "Social Media", href: "/admin/settings/social", icon: Globe },
      { label: "Google Analytics", href: "/admin/settings/analytics", icon: BarChart2 },
    ],
  },
  {
    section: "Users & Roles",
    icon: Shield,
    items: [
      { label: "Admin Users", href: "/admin/users/admins", icon: Shield },
    ],
  },
];

const ALL_NAV_ITEMS = NAV_GROUPS.flatMap((g) =>
  g.items.map((item) => ({ ...item, section: g.section, sectionIcon: g.icon }))
);

// ── Command Palette ──────────────────────────────────────────────────────────

function CommandPalette({
  open,
  onClose,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results =
    query.trim().length > 0
      ? ALL_NAV_ITEMS.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.section.toLowerCase().includes(query.toLowerCase())
      )
      : ALL_NAV_ITEMS.slice(0, 8);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => { setActiveIdx(0); }, [query]);

  const handleNavigate = useCallback(
    (href: string) => {
      router.push(href);
      onClose();
    },
    [router, onClose]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIdx]) {
      handleNavigate(results[activeIdx].href);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="cmd-palette-modal relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search pages, settings, tools..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 text-base text-gray-800 placeholder-gray-400 outline-none bg-transparent"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 text-[11px] text-gray-500 font-mono border border-gray-200">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[360px] overflow-y-auto py-2">
          {results.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">
              No results for &quot;{query}&quot;
            </div>
          ) : (
            <>
              {query.trim().length === 0 && (
                <p className="px-4 pb-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Quick Navigation
                </p>
              )}
              {results.map((item, idx) => {
                const Icon = item.icon;
                const isActive = idx === activeIdx;
                const isCurrent = pathname === item.href;
                return (
                  <button
                    key={item.href}
                    onClick={() => handleNavigate(item.href)}
                    onMouseEnter={() => setActiveIdx(idx)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors group ${isActive ? "bg-orange-50 text-gray-900" : "text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    <span
                      className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-colors ${isActive
                          ? "bg-[#f26b31] text-white"
                          : isCurrent
                            ? "bg-[#f26b31]/15 text-[#f26b31]"
                            : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                        }`}
                    >
                      <Icon size={15} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="block text-sm font-medium truncate">{item.label}</span>
                      <span className="block text-[11px] text-gray-400 truncate">{item.section}</span>
                    </div>
                    {isCurrent && (
                      <span className="text-[10px] text-[#f26b31] font-semibold bg-[#f26b31]/10 px-2 py-0.5 rounded-full shrink-0">
                        Current
                      </span>
                    )}
                    {isActive && !isCurrent && (
                      <ArrowRight size={14} className="text-[#f26b31] shrink-0" />
                    )}
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-gray-50/60">
          <div className="flex items-center gap-3 text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-gray-200 font-mono text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-gray-200 font-mono text-[10px]">↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-gray-200 font-mono text-[10px]">↵</kbd>
              open
            </span>
          </div>
          <span className="text-[11px] text-gray-400">{results.length} results</span>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar group component ──────────────────────────────────────────────────

function SidebarGroup({
  group,
  pathname,
  onLinkClick,
}: {
  group: NavGroup;
  pathname: string;
  onLinkClick: () => void;
}) {
  const isAnyActive = group.items.some((item) => pathname === item.href || pathname.startsWith(item.href + "/"));
  const [open, setOpen] = useState(isAnyActive);
  const GroupIcon = group.icon;

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors
          ${isAnyActive ? "text-[#f26b31]" : "text-gray-400 hover:text-gray-200"}`}
      >
        <GroupIcon size={14} className="shrink-0" />
        <span className="flex-1 text-left">{group.section}</span>
        {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
      </button>

      {open && (
        <div className="ml-3 mt-0.5 border-l border-white/10 pl-2 space-y-0.5">
          {group.items.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={onLinkClick}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors
                  ${active
                    ? "bg-[#f26b31] text-white font-medium"
                    : "text-gray-400 hover:bg-white/10 hover:text-white"}`}
              >
                <Icon size={14} className="shrink-0" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main layout ──────────────────────────────────────────────────────────────

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const [adminUser, setAdminUser] = useState<{ id: string; username: string } | null>(null);
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") { setChecked(true); return; }
    if (!isLoggedIn()) { router.replace("/admin/login"); return; }
    setChecked(true);

    getMe()
      .then((res) => {
        if (res.status === "success" && res.data) {
          setAdminUser(res.data);
        }
      })
      .catch(() => { });
  }, [pathname, router]);

  // Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  if (!checked) return null;
  if (pathname === "/admin/login") return <>{children}</>;

  const handleLogout = async () => {
    removeToken();
    await toast.success("Logout successful", "Aap successfully logout ho gaye");
    router.replace("/admin/login");
  };

  const activeItem = NAV_GROUPS.flatMap((g) => g.items).find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );

  return (
    <div className="min-h-screen flex bg-[#f0f2f5] font-inter">

      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        pathname={pathname}
      />

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#1a1a2e] text-white flex flex-col z-30
          transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 shrink-0">
          <Link href="/admin/dashboard" className="flex-1 min-w-0">
            <Image
              src="/images/logo/without_bg.png"
              alt="Ramdas Power Innovations"
              width={400}
              height={145}
              className="w-full max-w-[160px] h-auto object-contain"
              priority
            />
          </Link>
          <button
            className="lg:hidden text-gray-400 hover:text-white ml-2 shrink-0"
            onClick={() => setOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Command palette trigger */}
        <div className="px-3 py-2.5 border-b border-white/10 shrink-0">
          <button
            onClick={() => setCmdOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200 hover:border-white/20 transition-all group"
          >
            <Search size={13} className="shrink-0" />
            <span className="flex-1 text-left text-sm">Search...</span>
            <span className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
              <kbd className="flex items-center justify-center w-5 h-5 rounded bg-white/10 text-[10px] font-mono">
                <Command size={9} />
              </kbd>
              <kbd className="flex items-center justify-center w-5 h-5 rounded bg-white/10 text-[10px] font-mono">
                K
              </kbd>
            </span>
          </button>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto space-y-0.5 scrollbar-thin">
          {NAV_GROUPS.map((group) => (
            <SidebarGroup
              key={group.section}
              group={group}
              pathname={pathname}
              onLinkClick={() => setOpen(false)}
            />
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10 shrink-0">
          {adminUser && (
            <div className="flex items-center gap-3 px-3 py-2.5 mb-2 bg-white/5 rounded-lg border border-white/5">
              <div className="w-8 h-8 rounded-full bg-[#f26b31] flex items-center justify-center text-white text-xs font-bold capitalize shrink-0">
                {adminUser.username.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate capitalize">{adminUser.username}</p>
                <p className="text-[10px] text-gray-400">Logged In</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-red-600/20 hover:text-red-400 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col lg:ml-64 min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b-[3px] border-b-[#f26b31] px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
          <button
            className="lg:hidden text-gray-600 hover:text-gray-900"
            onClick={() => setOpen(true)}
          >
            <Menu size={22} />
          </button>
          <span className="text-sm font-semibold text-gray-700">
            {activeItem?.label ?? "Admin"}
          </span>

          {/* Search trigger in header (desktop) */}
          <button
            onClick={() => setCmdOpen(true)}
            className="hidden md:flex items-center gap-2 ml-4 px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all text-sm"
          >
            <Search size={13} />
            <span className="text-xs">Search...</span>
            <span className="flex items-center gap-0.5 ml-1 text-[10px] font-mono text-gray-300">
              <span>Ctrl</span><span>K</span>
            </span>
          </button>

          <div className="ml-auto flex items-center gap-4">
            {adminUser && (
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full text-xs text-gray-600 font-semibold shadow-inner">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <span>Active: <strong className="text-[#f26b31] capitalize">{adminUser.username}</strong></span>
              </div>
            )}
            <Link
              href="/"
              target="_blank"
              className="text-xs font-semibold text-gray-400 hover:text-[#f26b31] transition-colors"
            >
              View Site →
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
