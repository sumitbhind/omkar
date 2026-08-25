const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("cms_token") || "";
}

function getRefreshToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("cms_refresh_token") || "";
}

export function saveToken(token: string, refreshToken?: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("cms_token", token);
  if (refreshToken) {
    localStorage.setItem("cms_refresh_token", refreshToken);
  }
}

export function removeToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("cms_token");
  localStorage.removeItem("cms_refresh_token");
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export async function refreshToken(): Promise<string> {
  const rfToken = getRefreshToken();
  if (!rfToken) throw new Error("No refresh token available");

  const res = await authFetch(`${BASE}/api/admin/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: rfToken }) });

  const json = await res.json();
  if (!res.ok) {
    removeToken();
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login";
    }
    throw new Error(json.message || "Session expired");
  }

  saveToken(json.token, json.refreshToken);
  return json.token;
}

export async function authFetch(url: string, init?: RequestInit): Promise<Response> {
  const token = getToken();
  const headers = new Headers(init?.headers || {});
  
  if (init?.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let res = await fetch(url, { ...init, headers });
  if (res.status === 401) {
    const rfToken = getRefreshToken();
    if (rfToken) {
      try {
        const newToken = await refreshToken();
        headers.set("Authorization", `Bearer ${newToken}`);
        res = await fetch(url, { ...init, headers });
      } catch {
        removeToken();
        if (typeof window !== "undefined") {
          window.location.href = "/admin/login";
        }
      }
    }
  }
  return res;
}

// ── Export helpers ────────────────────────────────────────────────────────────
export async function getAllEnquiriesForExport() {
  const res = await authFetch(`${BASE}/api/enquiry?page=1&limit=9999`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch enquiries");
  return json.data as {
    _id: string; name: string; email: string; phone: string;
    company_name: string; message: string; status: string; createdAt: string;
  }[];
}

export async function getAllQuotesForExport() {
  const res = await authFetch(`${BASE}/api/quotes?page=1&limit=9999`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch quotes");
  return json.data as {
    _id: string; name: string; email: string; phone: string; company: string;
    products: { name: string; quantity: string }[]; budget: string;
    message: string; status: string; notes: string; createdAt: string;
  }[];
}

// ── Analytics ────────────────────────────────────────────────────────────────
export interface AnalyticsData {
  leads:     { today: number; week: number; month: number; total: number };
  enquiries: { today: number; week: number; month: number; total: number; byStatus: { new: number; read: number; replied: number } };
  quotes:    { today: number; week: number; month: number; total: number; byStatus: { new: number; read: number; quoted: number; closed: number } };
  content:   { products: number; categories: number; groups: number; media: number; blogs: number; subscribers: number; pricelist: number };
  chart:     { name: string; enquiries: number; quotes: number }[];
  recentLeads: { _id: string; type: "enquiry" | "quote"; name: string; email: string; phone: string; company: string; status: string; createdAt: string }[];
  generatedAt: string;
}

export async function getAnalytics(): Promise<AnalyticsData> {
  const res = await authFetch(`${BASE}/api/admin/analytics`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch analytics");
  return json.data as AnalyticsData;
}

// ── Dashboard Stats ──────────────────────────────────────────────────────────
export async function getDashboardStats() {
  const res = await authFetch(`${BASE}/api/admin/stats`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch stats");
  return json.data as {
    totalProducts: number;
    totalCategories: number;
    totalGroups: number;
    totalEnquiries: number;
    newEnquiries: number;
    graph: { name: string; leads: number }[];
  };
}

// ── Auth ────────────────────────────────────────────────────────────────────
export async function login(username: string, password: string) {
  const res = await fetch(`${BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed");
  return data;
}

export async function getMe() {
  const res = await authFetch(`${BASE}/api/admin/me`);
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}

export async function requestOtp(username: string, password: string) {
  const res = await fetch(`${BASE}/api/admin/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "OTP send failed");
  return data as { status: string; message: string };
}

export async function verifyOtp(username: string, otp: string) {
  const res = await fetch(`${BASE}/api/admin/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, otp }) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "OTP verification failed");
  return data as { status: string; token: string; refreshToken: string };
}

// ── Categories ──────────────────────────────────────────────────────────────
export async function getCategories() {
  const res = await authFetch(`${BASE}/api/categories`);
  return res.json();
}

export async function createCategory(name: string, slug: string) {
  const res = await authFetch(`${BASE}/api/categories`, { method: "POST", body: JSON.stringify({ name, slug }) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create category");
  return json;
}

export async function updateCategory(id: string, data: { name?: string; slug?: string; description?: string; order?: number; isActive?: boolean }) {
  const res = await authFetch(`${BASE}/api/categories/${id}`, { method: "PUT", body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update category");
  return json;
}

export async function deleteCategory(id: string) {
  const res = await authFetch(`${BASE}/api/categories/${id}`, {
    method: "DELETE" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to delete category");
  return json;
}

// ── Product Groups ───────────────────────────────────────────────────────────
export async function getProductGroups(categoryId?: string) {
  const url = categoryId
    ? `${BASE}/api/product-groups?category=${categoryId}`
    : `${BASE}/api/product-groups`;
  const res = await fetch(url);
  return res.json();
}

export async function createProductGroup(name: string, slug: string, categoryId: string, pageTitle = "") {
  const res = await authFetch(`${BASE}/api/product-groups`, { method: "POST", body: JSON.stringify({ name, slug, category: categoryId, pageTitle }) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create product group");
  return json;
}

export async function updateProductGroup(id: string, data: { name?: string; slug?: string; pageTitle?: string; order?: number; isActive?: boolean }) {
  const res = await authFetch(`${BASE}/api/product-groups/${id}`, { method: "PUT", body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update product group");
  return json;
}

export async function deleteProductGroup(id: string) {
  const res = await authFetch(`${BASE}/api/product-groups/${id}`, {
    method: "DELETE" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to delete product group");
  return json;
}

// ── Products ─────────────────────────────────────────────────────────────────
export async function getProductsByGroup(categorySlug: string, groupSlug: string) {
  const res = await authFetch(`${BASE}/api/products/${categorySlug}/${groupSlug}`);
  return res.json();
}

export async function createProduct(data: object) {
  const res = await authFetch(`${BASE}/api/products`, { method: "POST", body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create product");
  return json;
}

export async function updateProduct(id: string, data: object) {
  const res = await authFetch(`${BASE}/api/products/${id}`, { method: "PUT", body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update product");
  return json;
}

export async function deleteProduct(id: string) {
  const res = await authFetch(`${BASE}/api/products/${id}`, {
    method: "DELETE" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to delete product");
  return json;
}

// ── Enquiries ─────────────────────────────────────────────────────────────────
export async function getEnquiries(page = 1, status?: string) {
  let url = `${BASE}/api/enquiry?page=${page}&limit=20`;
  if (status) url += `&status=${status}`;
  const res = await authFetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch enquiries");
  return json;
}

export async function updateEnquiryStatus(id: string, status: string) {
  const res = await authFetch(`${BASE}/api/enquiry/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update status");
  return json;
}

// ── Settings ──────────────────────────────────────────────────────────────────
export async function getSettings() {
  const res = await authFetch(`${BASE}/api/settings`);
  return res.json();
}

export async function updateSettings(data: object) {
  const res = await authFetch(`${BASE}/api/admin/settings`, { method: "PUT", body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to save settings");
  return json;
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const res = await authFetch(`${BASE}/api/admin/change-password`, { method: "PUT", body: JSON.stringify({ currentPassword, newPassword }) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to change password");
  return json;
}

export async function changeUsername(newUsername: string) {
  const res = await authFetch(`${BASE}/api/admin/change-username`, { method: "PUT", body: JSON.stringify({ newUsername }) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to change username");
  return json;
}

// ── CMS Pages ─────────────────────────────────────────────────────────────────
export async function getCMSPage(section: string) {
  const res = await authFetch(`${BASE}/api/cms/${section}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch CMS page");
  return json.data as Record<string, unknown>;
}

export async function updateCMSPage(section: string, data: Record<string, unknown>) {
  const res = await authFetch(`${BASE}/api/cms/${section}`, { method: "PUT", body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update CMS page");
  return json.data as Record<string, unknown>;
}

// ── Certifications ─────────────────────────────────────────────────────────────
export interface Certification {
  _id: string;
  title: string;
  description: string;
  image: string;
  imagePublicId: string;
  year: string;
  order: number;
  isActive: boolean;
}

export async function getCertifications(all = false) {
  const url = all ? `${BASE}/api/certifications?all=true` : `${BASE}/api/certifications`;
  const res = await authFetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch certifications");
  return json.data as Certification[];
}

export async function createCertification(data: Partial<Certification>) {
  const res = await authFetch(`${BASE}/api/certifications`, { method: "POST", body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create certification");
  return json.data as Certification;
}

export async function updateCertification(id: string, data: Partial<Certification>) {
  const res = await authFetch(`${BASE}/api/certifications/${id}`, { method: "PUT", body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update certification");
  return json.data as Certification;
}

export async function deleteCertification(id: string) {
  const res = await authFetch(`${BASE}/api/certifications/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to delete certification");
  return json;
}

// ── Pricelist ──────────────────────────────────────────────────────────────────
export interface PricelistItem {
  _id: string;
  title: string;
  brand: string;
  pdfUrl: string;
  pdfPublicId: string;
  thumbnailUrl: string;
  month: string;
  year: string;
  order: number;
  isActive: boolean;
}

export async function getPricelistItems(all = false) {
  const url = all ? `${BASE}/api/pricelist?all=true` : `${BASE}/api/pricelist`;
  const res = await authFetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch pricelist");
  return json.data as PricelistItem[];
}

export async function createPricelistItem(data: Partial<PricelistItem>) {
  const res = await authFetch(`${BASE}/api/pricelist`, { method: "POST", body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create pricelist item");
  return json.data as PricelistItem;
}

export async function updatePricelistItem(id: string, data: Partial<PricelistItem>) {
  const res = await authFetch(`${BASE}/api/pricelist/${id}`, { method: "PUT", body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update pricelist item");
  return json.data as PricelistItem;
}

export async function deletePricelistItem(id: string) {
  const res = await authFetch(`${BASE}/api/pricelist/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to delete pricelist item");
  return json;
}

export async function uploadPdf(file: File, folder = "pricelist") {
  const formData = new FormData();
  formData.append("file", file);
  const res = await authFetch(`${BASE}/api/admin/upload/pdf?folder=${folder}`, { method: "POST", body: formData });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "PDF upload failed");
  return json.data as { url: string; publicId: string };
}

// ── Catalogues ────────────────────────────────────────────────────────────────
export interface Catalogue {
  _id: string;
  title: string;
  brand: string;
  category: string;
  description: string;
  pdfUrl: string;
  pdfPublicId: string;
  thumbnailUrl: string;
  year: string;
  order: number;
  isActive: boolean;
}

export async function getCatalogues(all = false) {
  const url = all ? `${BASE}/api/catalogues?all=true` : `${BASE}/api/catalogues`;
  const res = await authFetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch catalogues");
  return json.data as Catalogue[];
}

export async function createCatalogue(data: Partial<Catalogue>) {
  const res = await authFetch(`${BASE}/api/catalogues`, { method: "POST", body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create catalogue");
  return json.data as Catalogue;
}

export async function updateCatalogue(id: string, data: Partial<Catalogue>) {
  const res = await authFetch(`${BASE}/api/catalogues/${id}`, { method: "PUT", body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update catalogue");
  return json.data as Catalogue;
}

export async function deleteCatalogue(id: string) {
  const res = await authFetch(`${BASE}/api/catalogues/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to delete catalogue");
  return json;
}

// ── Careers ───────────────────────────────────────────────────────────────────
export interface CareerJob {
  _id: string;
  title: string;
  department: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Internship";
  description: string;
  requirements: string[];
  isActive: boolean;
  order: number;
}

export async function getCareerJobs(all = false) {
  const url = all ? `${BASE}/api/careers?all=true` : `${BASE}/api/careers`;
  const res = await authFetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch jobs");
  return json.data as CareerJob[];
}

export async function createCareerJob(data: Partial<CareerJob>) {
  const res = await authFetch(`${BASE}/api/careers`, { method: "POST", body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create job");
  return json.data as CareerJob;
}

export async function updateCareerJob(id: string, data: Partial<CareerJob>) {
  const res = await authFetch(`${BASE}/api/careers/${id}`, { method: "PUT", body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update job");
  return json.data as CareerJob;
}

export async function deleteCareerJob(id: string) {
  const res = await authFetch(`${BASE}/api/careers/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to delete job");
  return json;
}

// ── Brands ────────────────────────────────────────────────────────────────────
export interface Brand {
  _id: string;
  name: string;
  slug: string;
  logo: string;
  logoPublicId: string;
  description: string;
  website: string;
  order: number;
  isActive: boolean;
}

export async function getBrands(all = false) {
  const url = all ? `${BASE}/api/brands?all=true` : `${BASE}/api/brands`;
  const res = await authFetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch brands");
  return json.data as Brand[];
}

export async function createBrand(data: Partial<Brand>) {
  const res = await authFetch(`${BASE}/api/brands`, { method: "POST", body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create brand");
  return json.data as Brand;
}

export async function updateBrand(id: string, data: Partial<Brand>) {
  const res = await authFetch(`${BASE}/api/brands/${id}`, { method: "PUT", body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update brand");
  return json.data as Brand;
}

export async function deleteBrand(id: string) {
  const res = await authFetch(`${BASE}/api/brands/${id}`, {
    method: "DELETE" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to delete brand");
  return json;
}

// ── Panel Sections ────────────────────────────────────────────────────────────
export async function getPanelSections() {
  const res = await authFetch(`${BASE}/api/panel-sections`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch sections");
  return json;
}

export async function createPanelSection(name: string, slug: string, order = 0) {
  const res = await authFetch(`${BASE}/api/panel-sections`, { method: "POST", body: JSON.stringify({ name, slug, order }) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create section");
  return json;
}

export async function deletePanelSection(id: string) {
  const res = await authFetch(`${BASE}/api/panel-sections/${id}`, {
    method: "DELETE" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to delete section");
  return json;
}

// ── Panel Items ───────────────────────────────────────────────────────────────
export async function getPanelItems(section: string) {
  const res = await authFetch(`${BASE}/api/panel-items?section=${section}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch panel items");
  return json;
}

export async function getAllPanelItemsAdmin(section: string) {
  const res = await authFetch(`${BASE}/api/admin/panel-items?section=${section}`, );
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch panel items");
  return json;
}

export async function createPanelItem(data: { title: string; description: string; section: string; order?: number }) {
  const res = await authFetch(`${BASE}/api/panel-items`, { method: "POST", body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create panel item");
  return json;
}

export async function updatePanelItem(id: string, data: object) {
  const res = await authFetch(`${BASE}/api/panel-items/${id}`, { method: "PUT", body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update panel item");
  return json;
}

export async function deletePanelItem(id: string) {
  const res = await authFetch(`${BASE}/api/panel-items/${id}`, {
    method: "DELETE" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to delete panel item");
  return json;
}

// ── Media Files ───────────────────────────────────────────────────────────────
export interface MediaFile {
  _id: string;
  name: string;
  url: string;
  publicId: string;
  type: "image" | "pdf" | "video" | "download";
  folder: string;
  mimeType: string;
  size: number;
  thumbnail: string;
  altText: string;
  createdAt: string;
}

export async function getMediaFiles(opts: { type?: string; page?: number; q?: string; limit?: number; folder?: string } = {}) {
  const params = new URLSearchParams();
  if (opts.type)   params.set("type", opts.type);
  if (opts.page)   params.set("page", String(opts.page));
  if (opts.q)      params.set("q", opts.q);
  if (opts.limit)  params.set("limit", String(opts.limit));
  if (opts.folder) params.set("folder", opts.folder);
  const res = await authFetch(`${BASE}/api/media?${params}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch media");
  return json as { data: MediaFile[]; total: number; pages: number; page: number };
}

export async function createMediaFile(data: Partial<MediaFile>) {
  const res = await authFetch(`${BASE}/api/media`, { method: "POST", body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create media file");
  return json.data as MediaFile;
}

export async function updateMediaFile(id: string, data: { name?: string; altText?: string }) {
  const res = await authFetch(`${BASE}/api/media/${id}`, { method: "PUT", body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update media file");
  return json.data as MediaFile;
}

export async function deleteMediaFile(id: string) {
  const res = await authFetch(`${BASE}/api/media/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to delete media file");
  return json;
}

// ── Blog Posts ────────────────────────────────────────────────────────────────
export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: { _id: string; name: string; slug: string } | null;
  postType: "article" | "news";
  image: string;
  imagePublicId: string;
  tags: string[];
  status: "draft" | "published" | "archived";
  publishedAt: string | null;
  readTime: number;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export async function getBlogPosts(opts: { postType?: string; status?: string; category?: string; page?: number; q?: string } = {}) {
  const params = new URLSearchParams();
  if (opts.postType) params.set("postType", opts.postType);
  if (opts.status)   params.set("status",   opts.status);
  if (opts.category) params.set("category", opts.category);
  if (opts.page)     params.set("page",     String(opts.page));
  if (opts.q)        params.set("q",        opts.q);
  const res = await authFetch(`${BASE}/api/blog-posts?${params}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch blog posts");
  return json as { data: BlogPost[]; total: number; pages: number; page: number };
}

export async function getBlogPost(id: string) {
  const res = await authFetch(`${BASE}/api/blog-posts/${id}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch blog post");
  return json.data as BlogPost;
}

export interface BlogPostPayload {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  category?: string;
  postType?: "article" | "news";
  image?: string;
  imagePublicId?: string;
  tags?: string[];
  status?: "draft" | "published" | "archived";
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  order?: number;
  isActive?: boolean;
}

export async function createBlogPost(data: BlogPostPayload) {
  const res = await authFetch(`${BASE}/api/blog-posts`, { method: "POST", body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create blog post");
  return json.data as BlogPost;
}

export async function updateBlogPost(id: string, data: BlogPostPayload) {
  const res = await authFetch(`${BASE}/api/blog-posts/${id}`, { method: "PUT", body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update blog post");
  return json.data as BlogPost;
}

export async function deleteBlogPost(id: string) {
  const res = await authFetch(`${BASE}/api/blog-posts/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to delete blog post");
  return json;
}

// ── SEO Meta Tags ─────────────────────────────────────────────────────────────
export interface SeoMeta {
  _id: string;
  pageKey: string;
  pageLabel: string;
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  noIndex: boolean;
  updatedAt: string;
}

export async function getSeoMetas() {
  const res = await authFetch(`${BASE}/api/seo/meta`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch SEO meta");
  return json.data as SeoMeta[];
}

export async function upsertSeoMeta(pageKey: string, data: Partial<SeoMeta>) {
  const res = await authFetch(`${BASE}/api/seo/meta/${pageKey}`, { method: "PUT", body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to save SEO meta");
  return json.data as SeoMeta;
}

export async function createSeoMeta(data: Partial<SeoMeta>) {
  const res = await authFetch(`${BASE}/api/seo/meta`, { method: "POST", body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create SEO meta");
  return json.data as SeoMeta;
}

export async function deleteSeoMeta(pageKey: string) {
  const res = await authFetch(`${BASE}/api/seo/meta/${pageKey}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to delete SEO meta");
  return json;
}

// ── URL Redirects ─────────────────────────────────────────────────────────────
export interface UrlRedirect {
  _id: string;
  source: string;
  destination: string;
  type: 301 | 302;
  isActive: boolean;
  hitCount: number;
  createdAt: string;
}

export async function getUrlRedirects() {
  const res = await authFetch(`${BASE}/api/seo/redirects`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch redirects");
  return json.data as UrlRedirect[];
}

export async function createUrlRedirect(data: Partial<UrlRedirect>) {
  const res = await authFetch(`${BASE}/api/seo/redirects`, { method: "POST", body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create redirect");
  return json.data as UrlRedirect;
}

export async function updateUrlRedirect(id: string, data: Partial<UrlRedirect>) {
  const res = await authFetch(`${BASE}/api/seo/redirects/${id}`, { method: "PUT", body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update redirect");
  return json.data as UrlRedirect;
}

export async function deleteUrlRedirect(id: string) {
  const res = await authFetch(`${BASE}/api/seo/redirects/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to delete redirect");
  return json;
}

// ── Schema Markup ─────────────────────────────────────────────────────────────
export interface SchemaMarkup {
  _id: string;
  pageKey: string;
  pageLabel: string;
  schemaType: string;
  jsonLd: string;
  isActive: boolean;
  updatedAt: string;
}

export async function getSchemaMarkups() {
  const res = await authFetch(`${BASE}/api/seo/schema`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch schema markups");
  return json.data as SchemaMarkup[];
}

export async function upsertSchemaMarkup(pageKey: string, data: Partial<SchemaMarkup>) {
  const res = await authFetch(`${BASE}/api/seo/schema/${pageKey}`, { method: "PUT", body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to save schema markup");
  return json.data as SchemaMarkup;
}

export async function createSchemaMarkup(data: Partial<SchemaMarkup>) {
  const res = await authFetch(`${BASE}/api/seo/schema`, { method: "POST", body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create schema markup");
  return json.data as SchemaMarkup;
}

export async function deleteSchemaMarkup(pageKey: string) {
  const res = await authFetch(`${BASE}/api/seo/schema/${pageKey}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to delete schema markup");
  return json;
}

// ── Image Upload ──────────────────────────────────────────────────────────────
export async function uploadImage(file: File, folder = "products") {
  const formData = new FormData();
  formData.append("image", file);
  const res = await authFetch(`${BASE}/api/admin/upload?folder=${folder}`, { method: "POST", body: formData });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Upload failed");
  return json.data as { url: string; publicId: string };
}

// ── Popups ────────────────────────────────────────────────────────────────────
export interface Popup {
  _id: string;
  title: string;
  content: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  imagePublicId: string;
  type: "announcement" | "discount" | "newsletter" | "exit-intent";
  triggerDelay: number;
  bgColor: string;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

export async function getPopups(all = false) {
  const res = await authFetch(`${BASE}/api/popups${all ? "?all=true" : ""}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch popups");
  return json.data as Popup[];
}

export async function createPopup(data: Partial<Popup>) {
  const res = await authFetch(`${BASE}/api/popups`, { method: "POST", body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create popup");
  return json.data as Popup;
}

export async function updatePopup(id: string, data: Partial<Popup>) {
  const res = await authFetch(`${BASE}/api/popups/${id}`, { method: "PUT", body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update popup");
  return json.data as Popup;
}

export async function deletePopup(id: string) {
  const res = await authFetch(`${BASE}/api/popups/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to delete popup");
  return json;
}

// ── Admin Users ───────────────────────────────────────────────────────────────
export interface AdminUser {
  _id: string;
  username: string;
  name: string;
  email: string;
  role: "super-admin" | "admin" | "editor";
  isActive: boolean;
  avatar: string;
  createdAt: string;
}

export async function getAdminUsers() {
  const res = await authFetch(`${BASE}/api/admin/users`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch admin users");
  return json.data as AdminUser[];
}

export async function createAdminUser(data: { username: string; password: string; name?: string; email?: string; role?: string }) {
  const res = await authFetch(`${BASE}/api/admin/users`, { method: "POST", body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create admin user");
  return json.data as AdminUser;
}

export async function updateAdminUser(id: string, data: { name?: string; email?: string; role?: string; avatar?: string }) {
  const res = await authFetch(`${BASE}/api/admin/users/${id}`, { method: "PUT", body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update admin user");
  return json.data as AdminUser;
}

export async function toggleAdminUser(id: string) {
  const res = await authFetch(`${BASE}/api/admin/users/${id}/toggle`, { method: "PATCH" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to toggle admin user");
  return json.data as AdminUser;
}

export async function deleteAdminUser(id: string) {
  const res = await authFetch(`${BASE}/api/admin/users/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to delete admin user");
  return json;
}

export async function resetAdminPassword(id: string, newPassword: string) {
  const res = await authFetch(`${BASE}/api/admin/users/${id}/reset-password`, { method: "POST", body: JSON.stringify({ newPassword }) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to reset password");
  return json;
}

// ── Team Members ──────────────────────────────────────────────────────────────
export interface TeamMember {
  _id: string;
  name: string;
  designation: string;
  department: string;
  photo: string;
  photoPublicId: string;
  bio: string;
  email: string;
  phone: string;
  linkedin: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export async function getTeamMembers(all = true) {
  const res = await authFetch(`${BASE}/api/team-members${all ? "?all=true" : ""}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch team members");
  return json.data as TeamMember[];
}

export async function createTeamMember(data: Partial<TeamMember>) {
  const res = await authFetch(`${BASE}/api/team-members`, { method: "POST", body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create team member");
  return json.data as TeamMember;
}

export async function updateTeamMember(id: string, data: Partial<TeamMember>) {
  const res = await authFetch(`${BASE}/api/team-members/${id}`, { method: "PUT", body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update team member");
  return json.data as TeamMember;
}

export async function toggleTeamMember(id: string) {
  const res = await authFetch(`${BASE}/api/team-members/${id}/toggle`, { method: "PATCH" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to toggle team member");
  return json.data as TeamMember;
}

export async function deleteTeamMember(id: string) {
  const res = await authFetch(`${BASE}/api/team-members/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to delete team member");
  return json;
}

// ── Blog Categories Stub (To avoid compilation errors) ──────────────────────────
export interface BlogCategory {
  _id: string;
  name: string;
  slug: string;
}

export async function getBlogCategories(all?: boolean): Promise<BlogCategory[]> {
  return [];
}

// ── Banners ──────────────────────────────────────────────────────────────────

export interface Banner {
  _id: string;
  title: string;
  subtitle: string;
  image: string;
  bgColor: string;
  link: string;
  buttonText: string;
  position: string;
  order: number;
  isActive: boolean;
}

export async function getBannersAdmin(): Promise<Banner[]> {
  const res  = await authFetch(`${BASE}/api/banners/admin`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch banners");
  return json.data ?? [];
}

export async function createBanner(data: Omit<Banner, "_id">): Promise<Banner> {
  const res  = await authFetch(`${BASE}/api/banners`, { method: "POST", body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create banner");
  return json.data;
}

export async function updateBanner(id: string, data: Partial<Omit<Banner, "_id">>): Promise<Banner> {
  const res  = await authFetch(`${BASE}/api/banners/${id}`, { method: "PUT", body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update banner");
  return json.data;
}

export async function deleteBanner(id: string): Promise<void> {
  const res  = await authFetch(`${BASE}/api/banners/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to delete banner");
}

export async function toggleBanner(id: string): Promise<Banner> {
  const res  = await authFetch(`${BASE}/api/banners/${id}/toggle`, { method: "PATCH" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to toggle banner");
  return json.data;
}
