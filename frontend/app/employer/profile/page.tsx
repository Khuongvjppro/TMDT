"use client";

import { FormEvent, useEffect, useState } from "react";
import { getEmployerProfile, updateEmployerProfile, listEmployerTransactions } from "../../../lib/api";
import { useAuth } from "../../../components/auth-provider";
import { EmployerTransaction } from "../../../types";
import Link from "next/link";
import { Award, Clock, CheckCircle2, ArrowRight, Building2, Globe, MapPin, FileText, Save, TrendingUp, Users, Briefcase, CalendarDays, User, Map, Mail, Phone, Link2 } from "lucide-react";

export default function EmployerProfilePage() {
  const { auth, isReady } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    companyName: "",
    companyWebsite: "",
    companyLocation: "",
    mainDescription: "",
    companySize: "",
    foundedYear: "",
    industry: "",
    founder: "",
    headquarters: "",
    contactEmail: "",
    contactPhone: "",
    facebookLink: "",
    linkedinLink: "",
  });
  const [transactions, setTransactions] = useState<EmployerTransaction[]>([]);
  const [credits, setCredits] = useState<number | null>(null);

  const canAccess = auth?.user.role === "EMPLOYER";

  useEffect(() => {
    async function loadData() {
      if (!auth?.token || !canAccess) return;
      setIsLoading(true);
      setMessage("");
      try {
        const [profileData, transactionsData] = await Promise.all([
          getEmployerProfile(auth.token),
          listEmployerTransactions(auth.token),
        ]);

        let parsedDesc = {
          mainDescription: "",
          companySize: "",
          foundedYear: "",
          industry: "",
          founder: "",
          headquarters: "",
          contactEmail: "",
          contactPhone: "",
          facebookLink: "",
          linkedinLink: "",
        };

        try {
          if (profileData.item.description) {
            const data = JSON.parse(profileData.item.description);
            if (data && typeof data === "object" && data.isDetailed) {
              parsedDesc = { ...parsedDesc, ...data };
            } else {
              parsedDesc.mainDescription = profileData.item.description || "";
            }
          }
        } catch {
          parsedDesc.mainDescription = profileData.item.description || "";
        }

        setForm({
          companyName: profileData.item.companyName || "",
          companyWebsite: profileData.item.companyWebsite || "",
          companyLocation: profileData.item.companyLocation || "",
          mainDescription: parsedDesc.mainDescription,
          companySize: parsedDesc.companySize,
          foundedYear: parsedDesc.foundedYear,
          industry: parsedDesc.industry,
          founder: parsedDesc.founder,
          headquarters: parsedDesc.headquarters,
          contactEmail: parsedDesc.contactEmail,
          contactPhone: parsedDesc.contactPhone,
          facebookLink: parsedDesc.facebookLink,
          linkedinLink: parsedDesc.linkedinLink,
        });

        setCredits(profileData.item.credits ?? 0);
        const successTx = (transactionsData.items || []).filter((tx) => tx.status === "SUCCESS");
        
        const getPackageLevel = (name: string) => {
          if (name === "Scale") return 3;
          if (name === "Growth") return 2;
          if (name === "Starter") return 1;
          return 0;
        };

        const highestTx = successTx.reduce<EmployerTransaction | null>((highest, current) => {
          if (!highest) return current;

          const currentLevel = getPackageLevel(current.package.name);
          const highestLevel = getPackageLevel(highest.package.name);

          const getExp = (tx: EmployerTransaction) => {
            const startDate = tx.paidAt ? new Date(tx.paidAt) : new Date(tx.createdAt);
            const durationMs = tx.package.durationDays * 24 * 60 * 60 * 1000;
            const endDate = new Date(startDate.getTime() + durationMs);
            const isExpired = endDate.getTime() < Date.now();
            return { isExpired, endDate };
          };

          const currentExp = getExp(current);
          const highestExp = getExp(highest);

          // 1. Ưu tiên gói chưa hết hạn
          if (!currentExp.isExpired && highestExp.isExpired) return current;
          if (currentExp.isExpired && !highestExp.isExpired) return highest;

          // 2. Ưu tiên cấp độ gói cao hơn
          if (currentLevel !== highestLevel) {
            return currentLevel > highestLevel ? current : highest;
          }

          // 3. Nếu cùng cấp độ và trạng thái hạn, chọn gói hết hạn sau cùng
          return currentExp.endDate.getTime() > highestExp.endDate.getTime() ? current : highest;
        }, null);

        setTransactions(highestTx ? [highestTx] : []);
      } catch (error) {
        const nextMessage =
          error instanceof Error ? error.message : "Cannot load profile";
        setMessage(nextMessage);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [auth?.token, canAccess]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth?.token || !canAccess) {
      setMessage("Please login as EMPLOYER.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    const serializedDesc = JSON.stringify({
      isDetailed: true,
      mainDescription: form.mainDescription,
      companySize: form.companySize,
      foundedYear: form.foundedYear,
      industry: form.industry,
      founder: form.founder,
      headquarters: form.headquarters,
      contactEmail: form.contactEmail,
      contactPhone: form.contactPhone,
      facebookLink: form.facebookLink,
      linkedinLink: form.linkedinLink,
    });

    try {
      await updateEmployerProfile(auth.token, {
        companyName: form.companyName,
        companyWebsite: form.companyWebsite,
        companyLocation: form.companyLocation,
        description: serializedDesc,
      });
      setMessage("Update company profile success.");
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Update profile failed";
      setMessage(nextMessage);
    } finally {
      setIsSaving(false);
    }
  }

  if (!isReady) {
    return (
      <p className="rounded-2xl bg-white p-4 shadow">Loading session...</p>
    );
  }

  if (!auth) {
    return (
      <p className="rounded-2xl bg-white p-4 shadow">
        Please login as EMPLOYER to manage company profile.
      </p>
    );
  }

  if (!canAccess) {
    return (
      <p className="rounded-2xl bg-white p-4 shadow">
        Forbidden for role {auth.user.role}.
      </p>
    );
  }

  return (
    <section className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-white/95 p-6 shadow-2xl ring-1 ring-slate-100/50 backdrop-blur-md">
      {/* Background decorations */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-brand-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-slate-100 blur-3xl" />

      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between border-b border-slate-100 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-600">
            Employer Workspace
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 tracking-tight">
            Company Profile
          </h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Manage comprehensive company details, contact information, and active recruitment packages.
          </p>
        </div>
      </header>

      {isLoading ? (
        <p className="mt-3 text-sm text-slate-600">Loading profile...</p>
      ) : null}

      <form
        className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]"
        onSubmit={onSubmit}
      >
        <div className="space-y-6">
          {/* Section 1: Company Information */}
          <section className="rounded-3xl border border-slate-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm transition hover:shadow-md">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-brand-500" />
              Thông tin chung
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  Tên công ty
                </span>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Building2 className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    name="companyName"
                    placeholder="Tên công ty"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 focus:shadow-sm"
                    required
                    value={form.companyName}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        companyName: event.target.value,
                      }))
                    }
                    disabled={isLoading || isSaving}
                  />
                </div>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-slate-400" />
                  Website công ty
                </span>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Globe className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    name="companyWebsite"
                    placeholder="https://example.com"
                    type="url"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 focus:shadow-sm"
                    value={form.companyWebsite}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        companyWebsite: event.target.value,
                      }))
                    }
                    disabled={isLoading || isSaving}
                  />
                </div>
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  Địa chỉ
                </span>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <MapPin className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    name="companyLocation"
                    placeholder="e.g. Quận 1, TP. Hồ Chí Minh"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 focus:shadow-sm"
                    value={form.companyLocation}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        companyLocation: event.target.value,
                      }))
                    }
                    disabled={isLoading || isSaving}
                  />
                </div>
              </label>
            </div>
          </section>

          {/* Section 2: Business Details */}
          <section className="rounded-3xl border border-slate-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm transition hover:shadow-md">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-brand-500" />
              Chi tiết doanh nghiệp
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                  Quy mô nhân sự
                </span>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Users className="h-4 w-4 text-slate-400" />
                  </div>
                  <select
                    name="companySize"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 focus:shadow-sm appearance-none"
                    value={form.companySize}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        companySize: event.target.value,
                      }))
                    }
                    disabled={isLoading || isSaving}
                  >
                    <option value="">Chọn quy mô</option>
                    <option value="1-10 nhân viên">1-10 nhân viên</option>
                    <option value="11-50 nhân viên">11-50 nhân viên</option>
                    <option value="51-200 nhân viên">51-200 nhân viên</option>
                    <option value="201-500 nhân viên">201-500 nhân viên</option>
                    <option value="501-1000 nhân viên">501-1000 nhân viên</option>
                    <option value="1000+ nhân viên">1000+ nhân viên</option>
                  </select>
                </div>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                  Lĩnh vực hoạt động
                </span>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Briefcase className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    name="industry"
                    placeholder="e.g. Công nghệ, Thương mại điện tử"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 focus:shadow-sm"
                    value={form.industry}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        industry: event.target.value,
                      }))
                    }
                    disabled={isLoading || isSaving}
                  />
                </div>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                  Năm thành lập
                </span>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <CalendarDays className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    name="foundedYear"
                    placeholder="e.g. 2015"
                    type="number"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 focus:shadow-sm"
                    value={form.foundedYear}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        foundedYear: event.target.value,
                      }))
                    }
                    disabled={isLoading || isSaving}
                  />
                </div>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  Người sáng lập / CEO
                </span>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    name="founder"
                    placeholder="Họ tên người sáng lập"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 focus:shadow-sm"
                    value={form.founder}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        founder: event.target.value,
                      }))
                    }
                    disabled={isLoading || isSaving}
                  />
                </div>
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Map className="h-3.5 w-3.5 text-slate-400" />
                  Trụ sở chính
                </span>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Map className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    name="headquarters"
                    placeholder="Địa chỉ trụ sở chính"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 focus:shadow-sm"
                    value={form.headquarters}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        headquarters: event.target.value,
                      }))
                    }
                    disabled={isLoading || isSaving}
                  />
                </div>
              </label>
            </div>
          </section>

          {/* Section 3: Contact Details */}
          <section className="rounded-3xl border border-slate-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm transition hover:shadow-md">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Mail className="h-4 w-4 text-brand-500" />
              Thông tin liên hệ & Mạng xã hội
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  Email liên hệ
                </span>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    name="contactEmail"
                    placeholder="recruitment@company.com"
                    type="email"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 focus:shadow-sm"
                    value={form.contactEmail}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        contactEmail: event.target.value,
                      }))
                    }
                    disabled={isLoading || isSaving}
                  />
                </div>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  Số điện thoại liên hệ
                </span>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Phone className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    name="contactPhone"
                    placeholder="e.g. 028 1234 5678"
                    type="tel"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 focus:shadow-sm"
                    value={form.contactPhone}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        contactPhone: event.target.value,
                      }))
                    }
                    disabled={isLoading || isSaving}
                  />
                </div>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Link2 className="h-3.5 w-3.5 text-slate-400" />
                  Trang Facebook
                </span>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Link2 className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    name="facebookLink"
                    placeholder="https://facebook.com/yourpage"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 focus:shadow-sm"
                    value={form.facebookLink}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        facebookLink: event.target.value,
                      }))
                    }
                    disabled={isLoading || isSaving}
                  />
                </div>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Link2 className="h-3.5 w-3.5 text-slate-400" />
                  Trang LinkedIn
                </span>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Link2 className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    name="linkedinLink"
                    placeholder="https://linkedin.com/company/yourpage"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 focus:shadow-sm"
                    value={form.linkedinLink}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        linkedinLink: event.target.value,
                      }))
                    }
                    disabled={isLoading || isSaving}
                  />
                </div>
              </label>
            </div>
          </section>

          {/* Section 4: Detailed Description */}
          <section className="rounded-3xl border border-slate-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm transition hover:shadow-md">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand-500" />
              Mô tả chi tiết doanh nghiệp
            </h2>
            <label className="mt-4 block space-y-2">
              <span className="text-xs font-semibold text-slate-600">
                Mô tả chi tiết công ty (Sứ mệnh, tầm nhìn, văn hóa làm việc...)
              </span>
              <textarea
                name="mainDescription"
                placeholder="Nhập mô tả chi tiết..."
                className="h-44 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 focus:shadow-sm resize-none"
                value={form.mainDescription}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    mainDescription: event.target.value,
                  }))
                }
                disabled={isLoading || isSaving}
              />
            </label>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="submit"
              disabled={isLoading || isSaving}
              className="rounded-full bg-gradient-to-r from-brand-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:from-brand-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-brand-500/10 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Lưu Hồ Sơ"}
            </button>
            <p className="text-xs text-slate-400 italic">
              Mẹo: Hồ sơ đầy đủ thông tin giúp nâng cao độ uy tín của doanh nghiệp đối với ứng viên.
            </p>
          </div>
        </div>

        {/* Sidebar Packages */}
        <aside className="space-y-4">
          <article className="rounded-3xl border border-slate-200 bg-white/70 p-5 shadow-sm backdrop-blur-sm transition hover:shadow-md">
            <div className="flex items-center border-b border-slate-100 pb-3">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Award className="h-4 w-4 text-brand-600" />
                Gói dịch vụ đã mua
              </h3>
            </div>

            {/* Credit Balance */}
            <div className="mt-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-4 text-center border border-indigo-100/50 shadow-sm shadow-indigo-100/10">
              <p className="text-xs font-semibold text-indigo-500 flex items-center justify-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                Số dư bài đăng tuyển
              </p>
              <p className="mt-1.5 text-3xl font-black text-indigo-900 tracking-tight">
                {credits !== null ? credits : 0}{" "}
                <span className="text-xs font-bold text-indigo-500">Credits</span>
              </p>
            </div>

            {/* Packages List */}
            <div className="mt-4 space-y-3">
              {transactions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-center">
                  <p className="text-xs text-slate-400">Bạn chưa mua gói dịch vụ nào.</p>
                  <Link
                    href="/employer/billing"
                    className="mt-3.5 inline-flex items-center justify-center gap-1.5 rounded-full bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-700 w-full"
                  >
                    Mua gói ngay
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : (
                transactions.map((tx) => {
                  const startDate = tx.paidAt ? new Date(tx.paidAt) : new Date(tx.createdAt);
                  const durationMs = tx.package.durationDays * 24 * 60 * 60 * 1000;
                  const endDate = new Date(startDate.getTime() + durationMs);
                  const isExpired = endDate.getTime() < Date.now();
                  const daysLeft = Math.ceil((endDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));

                  // Curated colors for different packages
                  let pkgBadgeColor = "bg-slate-100 text-slate-700 border-slate-200";
                  let pkgBgColor = "from-slate-50/50 to-white hover:border-slate-300";
                  if (tx.package.name === "Growth") {
                    pkgBadgeColor = "bg-indigo-50 text-indigo-700 border-indigo-100";
                    pkgBgColor = "from-indigo-50/10 to-white hover:border-indigo-200";
                  } else if (tx.package.name === "Scale") {
                    pkgBadgeColor = "bg-amber-50 text-amber-700 border-amber-200";
                    pkgBgColor = "from-amber-50/10 to-white hover:border-amber-300";
                  }

                  return (
                    <div
                      key={tx.id}
                      className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br p-4 transition shadow-sm hover:shadow-md ${pkgBgColor}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${pkgBadgeColor}`}>
                          {tx.package.name}
                        </span>
                        {isExpired ? (
                          <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                            <Clock className="h-3 w-3" />
                            Hết hạn
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                            <CheckCircle2 className="h-3 w-3" />
                            Đang chạy
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex items-baseline justify-between">
                        <span className="text-xs font-semibold text-slate-500">
                          {tx.package.maxJobPosts} tin đăng
                        </span>
                        <span className="text-xs font-extrabold text-slate-900">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                            maximumFractionDigits: 0,
                          }).format(tx.amountCents)}
                        </span>
                      </div>

                      <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-[10px] text-slate-500">
                        <div className="flex justify-between">
                          <span>Ngày mua:</span>
                          <span className="font-semibold text-slate-600">
                            {startDate.toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ngày hết hạn:</span>
                          <span className="font-semibold text-slate-600">
                            {endDate.toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                        {!isExpired && daysLeft > 0 && (
                          <div className="mt-3 flex items-center justify-between font-bold text-indigo-600 bg-indigo-50/50 px-2.5 py-1.5 rounded-xl border border-indigo-100/30">
                            <span>Còn lại:</span>
                            <span>{daysLeft} ngày</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </article>
        </aside>
      </form>

      {message ? (
        <div className="fixed bottom-5 right-5 z-50 animate-slide-in flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl max-w-sm pointer-events-auto">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">ℹ</span>
          <p className="text-sm font-semibold text-slate-700">{message}</p>
          <button type="button" onClick={() => setMessage("")} className="text-slate-400 hover:text-slate-800 ml-2 font-bold">✕</button>
        </div>
      ) : null}
    </section>
  );
}
