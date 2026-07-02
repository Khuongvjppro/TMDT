"use client";

import { FormEvent, useEffect, useState } from "react";
import CandidateShell from "../../../components/candidate-shell";
import { useAuth } from "../../../components/auth-provider";
import { deleteCompanyReview, listCandidateCompanies, listCompanyReviews, saveCompanyReview } from "../../../lib/api";
import { getCompanyLogoUrl } from "../../../lib/job-utils";
import { CandidateCompany, CompanyReview } from "../../../types";

export default function ReviewsPage() {
  const { auth } = useAuth();
  const [companies, setCompanies] = useState<CandidateCompany[]>([]);
  const [reviews, setReviews] = useState<CompanyReview[]>([]);
  const [message, setMessage] = useState("");

  async function load() {
    if (!auth?.token || auth.user.role !== "CANDIDATE") return;
    try {
      const [companyData, reviewData] = await Promise.all([
        listCandidateCompanies(auth.token),
        listCompanyReviews(auth.token),
      ]);
      setCompanies(companyData.items);
      setReviews(reviewData.items);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load companies");
    }
  }

  useEffect(() => { load(); }, [auth?.token]);

  async function submit(event: FormEvent<HTMLFormElement>, employerId: number) {
    event.preventDefault();
    if (!auth?.token) return;
    const data = new FormData(event.currentTarget);
    try {
      await saveCompanyReview(auth.token, employerId, {
        rating: Number(data.get("rating")),
        title: String(data.get("title") || ""),
        content: String(data.get("content") || ""),
      });
      setMessage("Company review saved successfully.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save the review");
    }
  }

  async function remove(employerId: number) {
    if (!auth?.token || !window.confirm("Delete this company review?")) return;
    await deleteCompanyReview(auth.token, employerId);
    await load();
  }

  return (
    <CandidateShell title="Company Reviews" description="UC14: rate companies and create, update, or delete your reviews.">
      <div className="grid gap-5 md:grid-cols-2">
        {companies.map((company) => {
          const review = reviews.find((item) => item.employerId === company.id);
          return (
            <form key={`${company.id}-${company.companyName}`} onSubmit={(event) => submit(event, company.id)} className="space-y-3 rounded-3xl bg-white p-5 shadow-lg">
              <div className="flex justify-between gap-3">
                <div className="flex gap-3">
                  <img src={getCompanyLogoUrl(company.companyName)} alt={`${company.companyName} logo`} className="h-12 w-12 rounded-xl border border-slate-200 object-cover" />
                  <div><h2 className="text-lg font-black">{company.companyName}</h2><p className="text-sm text-slate-500">{company.locations.join(" · ")} · {company.openJobs} open {company.openJobs === 1 ? "role" : "roles"}</p></div>
                </div>
                <span className="h-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">★ {company.averageRating?.toFixed(1) || "New"} ({company.reviewCount})</span>
              </div>
              <select name="rating" defaultValue={review?.rating ?? 5} className="w-full rounded-xl border p-3"><option value="5">★★★★★ Excellent</option><option value="4">★★★★ Good</option><option value="3">★★★ Average</option><option value="2">★★ Needs improvement</option><option value="1">★ Poor</option></select>
              <input name="title" defaultValue={review?.title ?? ""} placeholder="Review title" className="w-full rounded-xl border p-3" />
              <textarea name="content" defaultValue={review?.content ?? ""} placeholder="Share your experience..." className="h-24 w-full rounded-xl border p-3" />
              <div className="flex gap-2"><button className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white">{review ? "Update Review" : "Submit Review"}</button>{review ? <button type="button" onClick={() => remove(company.id)} className="rounded-xl bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700">Delete</button> : null}</div>
            </form>
          );
        })}
      </div>
      {message ? <p className="rounded-2xl bg-white p-4 text-center font-semibold text-blue-700">{message}</p> : null}
    </CandidateShell>
  );
}
