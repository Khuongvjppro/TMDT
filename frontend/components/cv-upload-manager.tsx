"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "./auth-provider";
import {
  uploadCvFile,
  deleteCvFile,
  listCandidateCvs,
  createCandidateCv,
  updateCandidateCv,
  deleteCandidateCv,
} from "../lib/api";
import type { CandidateCv } from "../types";

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".png", ".jpg", ".jpeg"];
const MAX_SIZE_MB = 10;

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(format: string) {
  switch (format?.toLowerCase()) {
    case "pdf":
      return (
        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    case "doc":
    case "docx":
      return (
        <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    default:
      return (
        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
  }
}

export default function CvUploadManager() {
  const { auth } = useAuth();
  const token = auth?.token ?? "";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cvs, setCvs] = useState<CandidateCv[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load existing CVs
  const loadCvs = useCallback(async () => {
    if (!token) return;
    try {
      const data = await listCandidateCvs(token);
      setCvs(data.items);
    } catch (e: any) {
      console.error("Failed to load CVs", e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Load on mount
  useEffect(() => {
    loadCvs();
  }, [loadCvs]);

  // Validate file
  function validateFile(file: File): string | null {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File too large. Maximum size is ${MAX_SIZE_MB}MB`;
    }
    return null;
  }

  // Handle file upload
  async function handleFileUpload(file: File) {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSuccess(null);
    setUploading(true);
    setUploadProgress(0);

    // Simulate progress (since XHR progress isn't available with fetch)
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 90));
    }, 200);

    try {
      // 1. Upload to Cloudinary
      const uploadResult = await uploadCvFile(token, file);
      clearInterval(progressInterval);
      setUploadProgress(100);

      // 2. Create CV record in backend
      const cvTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      const makePrimary = cvs.length === 0;
      await createCandidateCv(token, {
        title: cvTitle,
        fileUrl: uploadResult.item.url,
        summary: null,
        isPrimary: makePrimary,
      });

      setSuccess(`"${file.name}" uploaded successfully!`);
      await loadCvs();
    } catch (e: any) {
      setError(e.message || "Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }

  // Handle drag & drop
  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // Set a CV as primary
  async function handleSetPrimary(cv: CandidateCv) {
    try {
      await updateCandidateCv(token, cv.id, { isPrimary: true });
      setSuccess(`"${cv.title}" set as primary CV`);
      await loadCvs();
    } catch (e: any) {
      setError(e.message || "Failed to set primary");
    }
  }

  // Delete a CV
  async function handleDelete(cv: CandidateCv) {
    if (!confirm(`Delete "${cv.title}"? This action cannot be undone.`)) return;
    try {
      // Delete from Cloudinary
      await deleteCvFile(token, cv.fileUrl);
      // Delete record from DB
      await deleteCandidateCv(token, cv.id);
      setSuccess(`"${cv.title}" deleted`);
      await loadCvs();
    } catch (e: any) {
      setError(e.message || "Failed to delete CV");
    }
  }

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-5 bg-slate-200 rounded w-1/3"></div>
          <div className="h-32 bg-slate-100 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900">My CVs / Resumes</h2>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">
            Upload and manage your CV files. Primary CV will be used for job applications.
          </p>
        </div>
        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
          {cvs.length} CV{cvs.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-bold text-red-700 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}
      {success && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-700 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {success}
          <button onClick={() => setSuccess(null)} className="ml-auto text-emerald-400 hover:text-emerald-600">✕</button>
        </div>
      )}

      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200
          ${dragActive
            ? "border-brand-500 bg-brand-50 scale-[1.01]"
            : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
          }
          ${uploading ? "pointer-events-none opacity-70" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_EXTENSIONS.join(",")}
          onChange={handleFileInput}
          className="hidden"
        />

        {uploading ? (
          <div className="space-y-3">
            <div className="w-10 h-10 mx-auto rounded-full bg-brand-100 flex items-center justify-center animate-pulse">
              <svg className="w-5 h-5 text-brand-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <p className="text-sm font-bold text-slate-700">Uploading...</p>
            <div className="w-48 mx-auto h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs font-semibold text-slate-400">{uploadProgress}%</p>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-sm font-bold text-slate-700">
              {dragActive ? "Drop your CV here" : "Click or drag a file to upload"}
            </p>
            <p className="text-xs font-semibold text-slate-400 mt-1">
              PDF, DOC, DOCX, XLS, XLSX, PNG, JPG — Max {MAX_SIZE_MB}MB
            </p>
          </>
        )}
      </div>

      {/* CV List */}
      {cvs.length > 0 && (
        <div className="space-y-2">
          {cvs.map((cv) => (
            <div
              key={cv.id}
              className={`
                group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200
                ${cv.isPrimary
                  ? "bg-brand-50 border-brand-200 shadow-sm"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
                }
              `}
            >
              {/* File Icon */}
              <div className="shrink-0">
                {getFileIcon(cv.fileUrl.split(".").pop() || "")}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 truncate">{cv.title}</h3>
                  {cv.isPrimary && (
                    <span className="shrink-0 text-[10px] font-black uppercase tracking-wider text-brand-600 bg-brand-100 px-2 py-0.5 rounded-full">
                      Primary
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-400 mt-0.5 truncate">
                  {cv.fileUrl.split("/").pop()} • Updated {new Date(cv.updatedAt).toLocaleDateString()}
                </p>
              </div>

              {/* Actions */}
              <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href={cv.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="View"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </a>
                <a
                  href={cv.fileUrl}
                  download
                  className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                  title="Download"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
                {!cv.isPrimary && (
                  <button
                    onClick={() => handleSetPrimary(cv)}
                    className="p-2 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                    title="Set as primary"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => handleDelete(cv)}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {cvs.length === 0 && !uploading && (
        <div className="text-center py-4">
          <p className="text-xs font-semibold text-slate-400">
            No CVs uploaded yet. Upload your first CV to get started!
          </p>
        </div>
      )}
    </div>
  );
}
