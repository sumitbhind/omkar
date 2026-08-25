"use client";
import { useState, useCallback } from "react";
import { RefreshCw, Copy, Download, CheckCircle, Globe } from "lucide-react";
import { getCategories, getProductGroups, getBlogPosts } from "@/lib/adminApi";

interface SitemapUrl {
  loc: string;
  priority: string;
  changefreq: string;
  section: string;
}

const BASE_URL = "https://ramdaspower.com";

const STATIC_PAGES: SitemapUrl[] = [
  { loc: "/",           priority: "1.0", changefreq: "weekly",  section: "Static" },
  { loc: "/about",      priority: "0.8", changefreq: "monthly", section: "Static" },
  { loc: "/products",   priority: "0.9", changefreq: "weekly",  section: "Static" },
  { loc: "/contact",    priority: "0.7", changefreq: "monthly", section: "Static" },
  { loc: "/careers",    priority: "0.6", changefreq: "monthly", section: "Static" },
  { loc: "/blog",       priority: "0.8", changefreq: "daily",   section: "Static" },
];

export default function SitemapPage() {
  const [urls, setUrls]       = useState<SitemapUrl[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied]   = useState(false);

  const generate = useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, blogRes] = await Promise.all([
        getCategories(),
        getBlogPosts({ status: "published", limit: 100 } as Parameters<typeof getBlogPosts>[0]),
      ]);

      const cats: SitemapUrl[] = (catRes.data || []).map((c: { slug: string }) => ({
        loc: `/products/${c.slug}`,
        priority: "0.8",
        changefreq: "weekly",
        section: "Categories",
      }));

      // Product groups for each category
      const groupResults = await Promise.all(
        (catRes.data || []).slice(0, 10).map((c: { _id: string; slug: string }) =>
          getProductGroups(c._id).then((r: { data?: { slug: string }[] }) => ({ catSlug: c.slug, groups: r.data || [] }))
        )
      );
      const groups: SitemapUrl[] = groupResults.flatMap(({ catSlug, groups }) =>
        groups.map((g: { slug: string }) => ({
          loc: `/products/${catSlug}/${g.slug}`,
          priority: "0.7",
          changefreq: "weekly",
          section: "Product Groups",
        }))
      );

      const posts: SitemapUrl[] = (blogRes.data || []).map((p: { slug: string; postType: string }) => ({
        loc: `/${p.postType === "news" ? "news" : "blog"}/${p.slug}`,
        priority: "0.6",
        changefreq: "monthly",
        section: p.postType === "news" ? "News" : "Blog",
      }));

      setUrls([...STATIC_PAGES, ...cats, ...groups, ...posts]);
      setGenerated(true);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${BASE_URL}${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join("\n")}
</urlset>`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(xmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([xmlContent], { type: "application/xml" });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "sitemap.xml"; a.click();
    URL.revokeObjectURL(url);
  };

  const sections = [...new Set(urls.map(u => u.section))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sitemap Generator</h1>
          <p className="text-sm text-gray-500 mt-0.5">Website ke saare URLs ka sitemap auto-generate karo</p>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="flex items-center gap-2 bg-[#f26b31] text-white px-5 py-2.5 rounded-lg hover:bg-[#d4581f] disabled:opacity-50 font-medium"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          {loading ? "Generating..." : generated ? "Regenerate" : "Generate Sitemap"}
        </button>
      </div>

      {!generated ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-xl border">
          <Globe size={48} className="mb-3 opacity-40" />
          <p className="text-lg font-medium">Sitemap Generate Karo</p>
          <p className="text-sm mt-1">Products, Categories, Blog posts se auto URLs collect karega</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {sections.map(s => (
              <div key={s} className="bg-white border rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-[#f26b31]">{urls.filter(u => u.section === s).length}</p>
                <p className="text-sm text-gray-500 mt-1">{s}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={handleCopy} className="flex items-center gap-2 border px-4 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
              {copied ? <CheckCircle size={15} className="text-green-600" /> : <Copy size={15} />}
              {copied ? "Copied!" : "Copy XML"}
            </button>
            <button onClick={handleDownload} className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700">
              <Download size={15} /> Download sitemap.xml
            </button>
            <span className="ml-auto text-sm text-gray-500 self-center">{urls.length} total URLs</span>
          </div>

          {/* URL Table */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">URL</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Section</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Priority</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Change Freq</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {urls.map((u, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-700">{BASE_URL}{u.loc}</td>
                    <td className="px-4 py-2.5 hidden md:table-cell">
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{u.section}</span>
                    </td>
                    <td className="px-4 py-2.5 hidden sm:table-cell text-center text-xs text-gray-500">{u.priority}</td>
                    <td className="px-4 py-2.5 hidden lg:table-cell text-center text-xs text-gray-500">{u.changefreq}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* XML Preview */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">XML Preview</p>
            <pre className="bg-gray-900 text-green-400 text-xs p-4 rounded-xl overflow-auto max-h-64 whitespace-pre-wrap">
              {xmlContent.slice(0, 1500)}{xmlContent.length > 1500 ? "\n... (truncated)" : ""}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}
