"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Upload, Download, Trash2, Search, FileDown, X, ExternalLink } from "lucide-react";
import { getMediaFiles, deleteMediaFile, type MediaFile } from "@/lib/adminApi";
import Swal from "sweetalert2";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("cms_token") || "";
}

async function uploadDownloadFile(file: File, folder = "downloads"): Promise<{ url: string; publicId: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE}/api/admin/upload/pdf?folder=${folder}&mediaType=download`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Upload failed");
  return json.data;
}

const ALLOWED_TYPES = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt,.csv";
const ALLOWED_LABEL = "PDF, Word, Excel, PPT, ZIP, TXT";

export default function DownloadsPage() {
  const [files, setFiles]         = useState<MediaFile[]>([]);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(false);
  const [q, setQ]                 = useState("");
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await getMediaFiles({ type: "download", page: p, q: q || undefined, limit: 20 });
      setFiles(res.data);
      setTotalPages(res.pages || 1);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [q]);

  useEffect(() => { load(page); }, [page, load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load(1);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;
    setUploading(true);
    try {
      for (const file of selectedFiles) {
        const { url, publicId } = await uploadDownloadFile(file, "downloads");
        // Manually create MediaFile record with type "download"
        await fetch(`${BASE}/api/media`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
          body: JSON.stringify({
            name: file.name,
            url,
            publicId,
            type: "download",
            folder: "downloads",
            mimeType: file.type,
            size: file.size,
          }),
        });
      }
      setPage(1);
      await load(1);
      Swal.fire({ icon: "success", title: `${selectedFiles.length} file(s) uploaded`, timer: 1500, showConfirmButton: false });
    } catch (err: unknown) {
      Swal.fire({ icon: "error", title: "Upload failed", text: err instanceof Error ? err.message : "Error" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = async (file: MediaFile) => {
    const result = await Swal.fire({
      title: "Delete file?",
      text: `"${file.name}" permanently delete ho jayegi.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Haan, delete karo",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteMediaFile(file._id);
      setFiles(prev => prev.filter(f => f._id !== file._id));
    } catch (err: unknown) {
      Swal.fire({ icon: "error", title: "Delete failed", text: err instanceof Error ? err.message : "Error" });
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return "—";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getExtension = (name: string) => {
    const parts = name.split(".");
    return parts.length > 1 ? parts.pop()!.toUpperCase() : "FILE";
  };

  const extColor: Record<string, string> = {
    PDF: "bg-red-100 text-red-700",
    DOC: "bg-blue-100 text-blue-700",
    DOCX: "bg-blue-100 text-blue-700",
    XLS: "bg-green-100 text-green-700",
    XLSX: "bg-green-100 text-green-700",
    PPT: "bg-orange-100 text-orange-700",
    PPTX: "bg-orange-100 text-orange-700",
    ZIP: "bg-yellow-100 text-yellow-700",
    RAR: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Downloads</h1>
          <p className="text-sm text-gray-500 mt-0.5">Downloadable files: {ALLOWED_LABEL}</p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 bg-[#f26b31] text-white px-5 py-2.5 rounded-lg hover:bg-[#d4581f] disabled:opacity-50 font-medium"
        >
          {uploading
            ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            : <Upload size={16} />
          }
          {uploading ? "Uploading..." : "Upload File"}
        </button>
        <input ref={fileRef} type="file" accept={ALLOWED_TYPES} multiple className="hidden" onChange={handleUpload} />
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-sm">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="File naam se search karo..."
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#f26b31]"
        />
        <button type="submit" className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg"><Search size={16} /></button>
        {q && (
          <button type="button" onClick={() => { setQ(""); setPage(1); load(1); }} className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg">
            <X size={16} />
          </button>
        )}
      </form>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">File</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Size</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Uploaded</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={4} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
              ))
            ) : files.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-400">
                <FileDown size={40} className="mx-auto mb-2 opacity-40" />
                <p>Koi download file nahi. Upload karo.</p>
              </td></tr>
            ) : files.map(file => {
              const ext = getExtension(file.name);
              const color = extColor[ext] || "bg-gray-100 text-gray-600";
              return (
                <tr key={file._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${color}`}>{ext}</span>
                      <span className="font-medium text-gray-800 truncate max-w-[200px]" title={file.name}>{file.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-gray-500">{formatSize(file.size)}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-500">{new Date(file.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <a href={file.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="View">
                        <ExternalLink size={15} />
                      </a>
                      <a href={file.url} download={file.name} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Download">
                        <Download size={15} />
                      </a>
                      <button onClick={() => handleDelete(file)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-gray-50 text-sm">Prev</button>
          <span className="text-sm text-gray-600">Page {page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-gray-50 text-sm">Next</button>
        </div>
      )}
    </div>
  );
}
