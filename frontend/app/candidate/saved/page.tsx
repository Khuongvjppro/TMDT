"use client";

import { useEffect, useState } from "react";
import { Job } from "../../../types";
import JobCard from "../../../components/job-card";
import { API_BASE_URL } from "../../../lib/api";

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSavedJobs() {
      try {
        const rawSaved = localStorage.getItem("jobfinder_saved_jobs");
        const savedIds: number[] = rawSaved ? JSON.parse(rawSaved) : [];

        if (savedIds.length === 0) {
          setSavedJobs([]);
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/jobs?limit=100`);
        if (response.ok) {
          const data = await response.json();
          const allJobs: Job[] = data.items || [];
          const filtered = allJobs.filter((job) => savedIds.includes(job.id));
          setSavedJobs(filtered);
        }
      } catch (error) {
        console.error("Failed to load saved jobs", error);
      } finally {
        setLoading(false);
      }
    }

    loadSavedJobs();
  }, []);

  return (
    <section className="space-y-6 max-w-5xl mx-auto px-4 py-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Saved Jobs</h1>
        <p className="text-sm font-semibold text-slate-500 mt-1">
          Manage your bookmarked job listings and track positions you are interested in.
        </p>
      </div>

      <hr className="border-slate-200" />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
        </div>
      ) : savedJobs.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
          <p className="text-sm font-bold text-slate-500">You haven not saved any jobs yet.</p>
          <p className="text-xs text-slate-400 mt-1">Bookmark jobs from the listings to see them here.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {savedJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </section>
  );
}
