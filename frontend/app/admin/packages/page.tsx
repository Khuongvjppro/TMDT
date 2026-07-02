// "use client";

// import Link from "next/link";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import {
//   Users,
//   ClipboardList,
//   ListChecks,
//   ShieldAlert,
//   ShieldCheck,
//   ChartBar,
//   Plus,
//   Search,
//   ChevronLeft,
//   ChevronRight,
//   Edit2,
//   Trash2,
//   ToggleLeft,
//   ToggleRight,
//   Loader2,
//   Package,
// } from "lucide-react";
// import { useAuth } from "../../../components/auth-provider";

// // Giả định cấu trúc API Client tương thích với dự án của bạn dựa trên adminApi và fetch
// const base = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// function getToken() {
//   if (typeof window === "undefined") return null;
//   let token = localStorage.getItem("accessToken") || localStorage.getItem("token");
//   if (!token) {
//     const raw = localStorage.getItem("jobfinder_auth");
//     if (raw) {
//       try {
//         token = JSON.parse(raw)?.token ?? null;
//       } catch {
//         token = null;
//       }
//     }
//   }
//   return token;
// }

// export default function AdminPackagesPage() {
//   const router = useRouter();
//   const { auth, isReady } = useAuth();

//   // State Quản lý danh sách & phân trang
//   const [packages, setPackages] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [page, setPage] = useState(1);
//   const [pageSize] = useState(10);
//   const [totalPages, setTotalPages] = useState(1);
//   const [includeInactive, setIncludeInactive] = useState(true);

//   // State Quản lý Form (Create / Edit)
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingPackage, setEditingPackage] = useState<any>(null);
//   const [formData, setFormData] = useState({
//     name: "",
//     price: "",
//     durationDays: "",
//     maxJobPosts: "",
//     isActive: true,
//   });

//   const [formError, setFormError] = useState<string | null>(null);
//   const [actionLoading, setActionLoading] = useState(false);

//   // Kiểm tra quyền Admin
//   useEffect(() => {
//     if (!isReady) return;
//     if (!auth || auth.user.role !== "ADMIN") {
//       router.push("/login");
//     }
//   }, [auth, isReady, router]);

//   // Fetch dữ liệu từ backend package.controller.ts
//   const loadPackages = async () => {
//     if (!auth || auth.user.role !== "ADMIN") return;
//     setLoading(true);
//     try {
//       const token = getToken();
//       const queryParams = new URLSearchParams({
//         page: page.toString(),
//         pageSize: pageSize.toString(),
//         includeInactive: includeInactive.toString(),
//         ...(search ? { search } : {}),
//       });

//       const res = await fetch(`${base}/admin/packages?${queryParams}`, {
//         headers: { Authorization: `Bearer ${token}` },
//         cache: "no-store",
//       });

//       if (res.ok) {
//         const data = await res.json();
//         if (data.success) {
//           setPackages(data.data.items || []);
//           setTotalPages(data.data.pagination.pages || 1);
//         }
//       }
//     } catch (err) {
//       console.error("Failed to load packages", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadPackages();
//   }, [auth, page, includeInactive]);

//   const handleSearchSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     setPage(1);
//     loadPackages();
//   };

//   // Mở modal thêm mới hoặc sửa
//   const openModal = (pkg: any = null) => {
//     setFormError(null);
//     if (pkg) {
//       setEditingPackage(pkg);
//       setFormData({
//         name: pkg.name,
//         price: pkg.price.toString(),
//         durationDays: pkg.durationDays.toString(),
//         maxJobPosts: pkg.maxJobPosts.toString(),
//         isActive: pkg.isActive,
//       });
//     } else {
//       setEditingPackage(null);
//       setFormData({
//         name: "",
//         price: "",
//         durationDays: "",
//         maxJobPosts: "",
//         isActive: true,
//       });
//     }
//     setIsModalOpen(true);
//   };

//   // Lưu Form (Create / Update)
//   const handleSavePackage = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setFormError(null);
//     setActionLoading(true);

//     // Chuyển đổi dữ liệu chuẩn validator
//     const payload = {
//       name: formData.name,
//       price: parseInt(formData.price),
//       durationDays: parseInt(formData.durationDays),
//       maxJobPosts: parseInt(formData.maxJobPosts),
//       ...(editingPackage ? {} : { isActive: formData.isActive }),
//     };

//     try {
//       const token = getToken();
//       const url = editingPackage 
//         ? `${base}/admin/packages/${editingPackage.id}` 
//         : `${base}/admin/packages`;
      
//       const method = editingPackage ? "PATCH" : "POST";

//       const res = await fetch(url, {
//         method,
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(payload),
//       });

//       const data = await res.json();

//       if (res.ok && data.success) {
//         setIsModalOpen(false);
//         loadPackages();
//       } else {
//         setFormError(data.message || "Something went wrong.");
//       }
//     } catch (err) {
//       setFormError("Network error. Please try again.");
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   // Thay đổi trạng thái On/Off (setPackageStatus)
//   const handleToggleStatus = async (id: number, currentStatus: boolean) => {
//     try {
//       const token = getToken();
//       const res = await fetch(`${base}/admin/packages/${id}/status`, {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ isActive: !currentStatus }),
//       });

//       if (res.ok) {
//         loadPackages();
//       } else {
//         const data = await res.json();
//         alert(data.message || "Failed to change status");
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // Xóa Package (deletePackage)
//   const handleDeletePackage = async (id: number) => {
//     if (!confirm("Are you sure you want to delete this package?")) return;
//     try {
//       const token = getToken();
//       const res = await fetch(`${base}/admin/packages/${id}`, {
//         method: "DELETE",
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const data = await res.json();
//       if (res.ok && data.success) {
//         loadPackages();
//       } else {
//         alert(data.message || "Cannot delete package with existing transactions. Disable it instead.");
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   return (
//     <section className="grid gap-8 py-8 xl:grid-cols-[320px_1fr]">
//       {/* Sidebar Navigation - Giữ nguyên kiến trúc của Dashboard */}
//       <aside className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm h-fit">
//         <div>
//           <h1 className="mt-3 text-3xl font-bold text-slate-900">Packages</h1>
//         </div>

//         <nav className="space-y-3 mt-4">
//           <Link
//             href="/admin"
//             className="flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
//           >
//             <ChartBar className="h-5 w-5" />
//             Dashboard Overview
//           </Link>

//           <Link
//             href="/admin/users"
//             className="flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
//           >
//             <Users className="h-5 w-5" />
//             User Management
//           </Link>

//           <Link
//             href="/admin/moderation"
//             className="flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
//           >
//             <ClipboardList className="h-5 w-5" />
//             Moderation Queue
//           </Link>

//           <Link
//             href="/admin/categories"
//             className="flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
//           >
//             <ListChecks className="h-5 w-5" />
//             System Categories
//           </Link>

//           <Link
//             href="/admin/packages"
//             className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-blue-600 shadow-sm"
//           >
//             <ShieldAlert className="h-5 w-5 text-blue-600" />
//             Service Packages
//           </Link>

//           <Link
//             href="/admin/reviews"
//             className="flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
//           >
//             <ShieldCheck className="h-5 w-5" />
//             Review Management
//           </Link>
//         </nav>
//       </aside>

//       {/* Main Content Area */}
//       <div className="space-y-6">
//         {/* Header Baner */}
//         <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
//           <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//             <div>
//               <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
//                 Management
//               </p>
//               <h2 className="mt-2 text-3xl font-bold text-slate-900">Service Packages</h2>
//               <p className="mt-1 text-sm text-slate-600">
//                 Configure billing plans, durations, and job posting limits for employers.
//               </p>
//             </div>
//             <button
//               onClick={() => openModal()}
//               className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
//             >
//               <Plus className="h-4 w-4" />
//               Create Package
//             </button>
//           </div>

//           {/* Filters & Search Toolbar */}
//           <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-6 border-t border-slate-100">
//             <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
//               <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
//               <input
//                 type="text"
//                 placeholder="Search package by name..."
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
//               />
//             </form>

//             <div className="flex items-center gap-2">
//               <label className="text-sm font-medium text-slate-600 flex items-center gap-2 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={includeInactive}
//                   onChange={(e) => setIncludeInactive(e.target.checked)}
//                   className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 border-slate-300"
//                 />
//                 Show Inactive Packages
//               </label>
//             </div>
//           </div>
//         </div>

//         {/* Data Table Content */}
//         <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
//           {loading ? (
//             <div className="flex flex-col items-center justify-center py-20 space-y-3">
//               <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
//               <p className="text-sm text-slate-500">Loading billing packages...</p>
//             </div>
//           ) : packages.length === 0 ? (
//             <div className="text-center py-20">
//               <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
//               <p className="text-slate-900 font-semibold">No packages found</p>
//               <p className="text-sm text-slate-500 mt-1">Try adjusting your search criteria or add a new plan.</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-left border-collapse">
//                 <thead>
//                   <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
//                     <th className="p-5">Package Name</th>
//                     <th className="p-5">Price</th>
//                     <th className="p-5">Duration</th>
//                     <th className="p-5">Job Limit</th>
//                     <th className="p-5">Status</th>
//                     <th className="p-5 text-right">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
//                   {packages.map((pkg) => (
//                     <tr key={pkg.id} className="hover:bg-slate-50/50 transition">
//                       <td className="p-5 font-semibold text-slate-900">{pkg.name}</td>
//                       <td className="p-5 font-mono text-slate-600">
//                         {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(pkg.price)}
//                       </td>
//                       <td className="p-5">{pkg.durationDays} Days</td>
//                       <td className="p-5">{pkg.maxJobPosts} Posts</td>
//                       <td className="p-5">
//                         <span
//                           className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
//                             pkg.isActive
//                               ? "bg-green-50 text-green-700"
//                               : "bg-slate-100 text-slate-600"
//                           }`}
//                         >
//                           <span className={`h-1.5 w-1.5 rounded-full ${pkg.isActive ? "bg-green-600" : "bg-slate-400"}`} />
//                           {pkg.isActive ? "Active" : "Inactive"}
//                         </span>
//                       </td>
//                       <td className="p-5 text-right space-x-1">
//                         <button
//                           onClick={() => handleToggleStatus(pkg.id, pkg.isActive)}
//                           title={pkg.isActive ? "Disable package" : "Enable package"}
//                           className={`p-2 rounded-xl border transition ${
//                             pkg.isActive 
//                               ? "text-amber-600 hover:bg-amber-50 border-transparent" 
//                               : "text-green-600 hover:bg-green-50 border-transparent"
//                           }`}
//                         >
//                           {pkg.isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
//                         </button>
//                         <button
//                           onClick={() => openModal(pkg)}
//                           className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
//                         >
//                           <Edit2 className="h-4 w-4" />
//                         </button>
//                         <button
//                           onClick={() => handleDeletePackage(pkg.id)}
//                           className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition"
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}

//           {/* Pagination Toolbar */}
//           {!loading && packages.length > 0 && (
//             <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100">
//               <p className="text-sm text-slate-600">
//                 Page <span className="font-semibold text-slate-900">{page}</span> of{" "}
//                 <span className="font-semibold text-slate-900">{totalPages}</span>
//               </p>
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => setPage((p) => Math.max(p - 1, 1))}
//                   disabled={page === 1}
//                   className="p-2 rounded-xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50 disabled:opacity-50 transition"
//                 >
//                   <ChevronLeft className="h-4 w-4" />
//                 </button>
//                 <button
//                   onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
//                   disabled={page === totalPages}
//                   className="p-2 rounded-xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50 disabled:opacity-50 transition"
//                 >
//                   <ChevronRight className="h-4 w-4" />
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Synchronous Create/Edit Dialog Modal */}
//       {isModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
//           <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl border border-slate-100 flex flex-col max-h-[90vh]">
//             <h3 className="text-xl font-bold text-slate-900">
//               {editingPackage ? "Update Service Package" : "Create Service Package"}
//             </h3>
//             <p className="text-sm text-slate-500 mt-1">
//               {editingPackage ? "Modify parameters for this plan." : "Define specific traits for a new subscription package."}
//             </p>

//             <form onSubmit={handleSavePackage} className="space-y-4 mt-6 overflow-y-auto pr-1 flex-1">
//               {formError && (
//                 <div className="rounded-2xl bg-rose-50 border border-rose-100 p-3 text-sm font-medium text-rose-600">
//                   {formError}
//                 </div>
//               )}

//               <div>
//                 <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Package Name</label>
//                 <input
//                   type="text"
//                   required
//                   value={formData.name}
//                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                   placeholder="e.g., Premium Monthly Plan"
//                   className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Price (VND)</label>
//                 <input
//                   type="number"
//                   required
//                   min="1"
//                   value={formData.price}
//                   onChange={(e) => setFormData({ ...formData, price: e.target.value })}
//                   placeholder="e.g., 500000"
//                   className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Duration (Days)</label>
//                   <input
//                     type="number"
//                     required
//                     min="1"
//                     max="3650"
//                     value={formData.durationDays}
//                     onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
//                     placeholder="30"
//                     className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Max Job Posts</label>
//                   <input
//                     type="number"
//                     required
//                     min="1"
//                     value={formData.maxJobPosts}
//                     onChange={(e) => setFormData({ ...formData, maxJobPosts: e.target.value })}
//                     placeholder="10"
//                     className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
//                   />
//                 </div>
//               </div>

//               {!editingPackage && (
//                 <div className="flex items-center gap-2 pt-2">
//                   <input
//                     type="checkbox"
//                     id="isActive"
//                     checked={formData.isActive}
//                     onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
//                     className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 border-slate-300"
//                   />
//                   <label htmlFor="isActive" className="text-sm font-medium text-slate-700 cursor-pointer">
//                     Activate package immediately
//                   </label>
//                 </div>
//               )}

//               <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
//                 <button
//                   type="button"
//                   onClick={() => setIsModalOpen(false)}
//                   disabled={actionLoading}
//                   className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={actionLoading}
//                   className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
//                 >
//                   {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
//                   {editingPackage ? "Update Package" : "Create Package"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </section>
//   );
// }
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  ClipboardList,
  ListChecks,
  ShieldAlert,
  ShieldCheck,
  ChartBar,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Package,
} from "lucide-react";
import { useAuth } from "../../../components/auth-provider";

// Cấu hình URL endpoint kết nối tới Back-end Express của bạn
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

// Hàm helper đồng bộ lấy token bảo mật tương tự trang admin chính
function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  let token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  if (!token) {
    const rawAuth = localStorage.getItem("jobfinder_auth");
    if (rawAuth) {
      try {
        const parsed = JSON.parse(rawAuth);
        token = parsed?.token || parsed?.state?.user?.token || null;
      } catch {
        token = null;
      }
    }
  }
  return token;
}

export default function AdminPackagesPage() {
  const router = useRouter();
  const { auth, isReady } = useAuth();

  // Các State quản lý dữ liệu danh sách và phân trang
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [includeInactive, setIncludeInactive] = useState<boolean>(true);

  // Các State quản lý Popup Modal (Thêm / Sửa)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPackage, setEditingPackage] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    durationDays: "",
    maxJobPosts: "",
    isActive: true,
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Hàm tải danh sách gói dịch vụ từ API thực tế (package.controller.ts)
  const loadPackages = React.useCallback(async () => {
    setLoading(true);
    try {
      const token = getStoredToken();
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        includeInactive: includeInactive.toString(),
      });
      if (search.trim()) {
        queryParams.append("search", search.trim());
      }

      const res = await fetch(`${BASE_URL}/admin/packages?${queryParams}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        cache: "no-store",
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setPackages(result.data?.items || result.items || []);
          const totalCount = result.data?.pagination?.total || result.pagination?.total || 0;
          setTotalPages(Math.ceil(totalCount / pageSize) || 1);
        }
      }
    } catch (err) {
      console.error("Error loading billing packages:", err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, includeInactive, search]);

  // Kiểm tra quyền hạn Admin & Điều hướng bảo mật bảo vệ trang
  useEffect(() => {
    if (!isReady) return;
    if (!auth || auth.user?.role !== "ADMIN") {
      router.push("/login");
    } else {
      loadPackages();
    }
  }, [auth, isReady, router, loadPackages]);

  // Xử lý submit bộ lọc tìm kiếm tên gói
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadPackages();
  };

  // Mở trình quản lý Modal điền dữ liệu
  const handleOpenModal = (pkg: any = null) => {
    setFormError(null);
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        name: pkg.name,
        price: pkg.price.toString(),
        durationDays: pkg.durationDays.toString(),
        maxJobPosts: pkg.maxJobPosts.toString(),
        isActive: pkg.isActive,
      });
    } else {
      setEditingPackage(null);
      setFormData({
        name: "",
        price: "",
        durationDays: "",
        maxJobPosts: "",
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  // Gửi thông tin form tạo mới hoặc cập nhật lên backend
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setActionLoading(true);

    const payload = {
      name: formData.name.trim(),
      price: parseInt(formData.price, 10),
      durationDays: parseInt(formData.durationDays, 10),
      maxJobPosts: parseInt(formData.maxJobPosts, 10),
      ...(!editingPackage ? { isActive: formData.isActive } : {}),
    };

    try {
      const token = getStoredToken();
      const url = editingPackage
        ? `${BASE_URL}/admin/packages/${editingPackage.id}`
        : `${BASE_URL}/admin/packages`;
      const method = editingPackage ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsModalOpen(false);
        loadPackages();
      } else {
        setFormError(data.message || "An error occurred while saving the package.");
      }
    } catch (err) {
      setFormError("Network execution error. Please check server status.");
    } finally {
      setActionLoading(false);
    }
  };

  // Thay đổi nhanh trạng thái Kích hoạt / Tắt kích hoạt gói
  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const token = getStoredToken();
      const res = await fetch(`${BASE_URL}/admin/packages/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        loadPackages();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to switch status.");
      }
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  // Xóa vĩnh viễn gói (Nếu chưa có bất kỳ giao dịch nào tồn tại)
  const handleDeletePackage = async (id: number) => {
    if (!window.confirm("Are you sure you want to permanently delete this service package?")) return;
    try {
      const token = getStoredToken();
      const res = await fetch(`${BASE_URL}/admin/packages/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        loadPackages();
      } else {
        alert(data.message || "Cannot delete package with active transactions. Consider turning it off instead.");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <section className="grid gap-8 py-8 xl:grid-cols-[320px_1fr]">
      {/* Sidebar Navigation - Đồng bộ 100% Layout Admin Dashboard */}
      <aside className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm h-fit">
        <div>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Packages</h1>
        </div>

        <nav className="space-y-3 mt-4">
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <ChartBar className="h-5 w-5" />
            Dashboard Overview
          </Link>

          <Link
            href="/admin/users"
            className="flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <Users className="h-5 w-5" />
            User Management
          </Link>

          <Link
            href="/admin/moderation"
            className="flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <ClipboardList className="h-5 w-5" />
            Moderation Queue
          </Link>

          <Link
            href="/admin/categories"
            className="flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <ListChecks className="h-5 w-5" />
            System Categories
          </Link>

          <Link
            href="/admin/packages"
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-blue-600 shadow-sm"
          >
            <ShieldAlert className="h-5 w-5 text-blue-600" />
            Service Packages
          </Link>

          <Link
            href="/admin/reviews"
            className="flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <ShieldCheck className="h-5 w-5" />
            Review Management
          </Link>
        </nav>
      </aside>

      {/* Vùng Content chính */}
      <div className="space-y-6">
        {/* Banner tiêu đề trang */}
        <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Management
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">Service Packages</h2>
              <p className="mt-1 text-sm text-slate-600">
                Configure billing plans, post durations, and job quotas for recruiters.
              </p>
            </div>
            <button
              onClick={() => handleOpenModal(null)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create Package
            </button>
          </div>

          {/* Công cụ Tìm kiếm & Lọc dữ liệu */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-6 border-t border-slate-100">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search package by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </form>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-600 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeInactive}
                  onChange={(e) => setIncludeInactive(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 border-slate-300"
                />
                Show Inactive Packages
              </label>
            </div>
          </div>
        </div>

        {/* Bảng chứa dữ liệu */}
        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm text-slate-500">Loading system billing packages...</p>
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-20">
              <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-900 font-semibold">No packages found</p>
              <p className="text-sm text-slate-500 mt-1">Try adapting your filters or create a new subscription tier.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="p-5">Package Name</th>
                    <th className="p-5">Price</th>
                    <th className="p-5">Duration</th>
                    <th className="p-5">Job Limit</th>
                    <th className="p-5">Status</th>
                    <th className="p-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {packages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-5 font-semibold text-slate-900">{pkg.name}</td>
                      <td className="p-5 font-mono text-slate-600">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(pkg.price)}
                      </td>
                      <td className="p-5">{pkg.durationDays} Days</td>
                      <td className="p-5">{pkg.maxJobPosts} Posts</td>
                      <td className="p-5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            pkg.isActive
                              ? "bg-green-50 text-green-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${pkg.isActive ? "bg-green-600" : "bg-slate-400"}`} />
                          {pkg.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-5 text-right space-x-1">
                        <button
                          onClick={() => handleToggleStatus(pkg.id, pkg.isActive)}
                          title={pkg.isActive ? "Disable package" : "Enable package"}
                          className={`p-2 rounded-xl transition ${
                            pkg.isActive 
                              ? "text-amber-600 hover:bg-amber-50" 
                              : "text-green-600 hover:bg-green-50"
                          }`}
                        >
                          {pkg.isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                        </button>
                        <button
                          onClick={() => handleOpenModal(pkg)}
                          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePackage(pkg.id)}
                          className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Bộ điều khiển phân trang */}
          {!loading && packages.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100">
              <p className="text-sm text-slate-600">
                Page <span className="font-semibold text-slate-900">{page}</span> of{" "}
                <span className="font-semibold text-slate-900">{totalPages}</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="p-2 rounded-xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50 disabled:opacity-50 transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="p-2 rounded-xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50 disabled:opacity-50 transition"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialog Modal chỉnh sửa biểu mẫu */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl border border-slate-100 flex flex-col max-h-[90vh]">
            <h3 className="text-xl font-bold text-slate-900">
              {editingPackage ? "Update Service Package" : "Create Service Package"}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {editingPackage ? "Modify parameters for this business plan." : "Define features for a new subscription layer."}
            </p>

            <form onSubmit={handleSavePackage} className="space-y-4 mt-6 overflow-y-auto pr-1 flex-1">
              {formError && (
                <div className="rounded-2xl bg-rose-50 border border-rose-100 p-3 text-sm font-medium text-rose-600">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Package Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Enterprise Premium"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Price (VND)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g., 2500000"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="3650"
                    value={formData.durationDays}
                    onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                    placeholder="30"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Max Job Posts</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.maxJobPosts}
                    onChange={(e) => setFormData({ ...formData, maxJobPosts: e.target.value })}
                    placeholder="25"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {!editingPackage && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 border-slate-300"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-slate-700 cursor-pointer">
                    Activate package tier instantly
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={actionLoading}
                  className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingPackage ? "Update Plan" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}