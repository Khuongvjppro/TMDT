"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  createCandidateCv,
  deleteCandidateCv,
  fetchCandidateProfile,
  listCandidateCvs,
  setDefaultCandidateCv,
  updateCandidateCv,
  updateCandidateProfile,
} from "../../../lib/api";
import { useAuth } from "../../../components/auth-provider";
import { CandidateCv, CandidateProfile } from "../../../types";

type ProfileFormState = {
  fullName: string;
  phone: string;
  bio: string;
  cvLink: string;
};

type CvFormState = {
  title: string;
  cvUrl: string;
  summary: string;
  isDefault: boolean;
};

const EMPTY_PROFILE_FORM: ProfileFormState = {
  fullName: "",
  phone: "",
  bio: "",
  cvLink: "",
};

const EMPTY_CV_FORM: CvFormState = {
  title: "",
  cvUrl: "",
  summary: "",
  isDefault: false,
};

function isValidUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function toProfileForm(profile: CandidateProfile): ProfileFormState {
  return {
    fullName: profile.fullName,
    phone: profile.phone || "",
    bio: profile.bio || "",
    cvLink: profile.cvLink || "",
  };
}

export default function CandidateProfilePage() {
  const { auth, isReady, setAuthState } = useAuth();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [cvs, setCvs] = useState<CandidateCv[]>([]);

  const [profileForm, setProfileForm] =
    useState<ProfileFormState>(EMPTY_PROFILE_FORM);
  const [cvForm, setCvForm] = useState<CvFormState>(EMPTY_CV_FORM);

  const [editingCvId, setEditingCvId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingCv, setIsSavingCv] = useState(false);
  const [settingDefaultId, setSettingDefaultId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [profileMessage, setProfileMessage] = useState("");
  const [cvMessage, setCvMessage] = useState("");

  async function loadCandidateData(token: string) {
    setIsLoading(true);
    try {
      const [profileRes, cvRes] = await Promise.all([
        fetchCandidateProfile(token),
        listCandidateCvs(token),
      ]);

      setProfile(profileRes.item);
      setProfileForm(toProfileForm(profileRes.item));
      setCvs(cvRes.items);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Cannot load candidate profile data";
      setProfileMessage(message);
      setCvMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!auth?.token || auth.user.role !== "CANDIDATE") return;
    loadCandidateData(auth.token);
  }, [auth?.token, auth?.user.role]);

  async function onSubmitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth?.token) return;

    setIsSavingProfile(true);
    setProfileMessage("");

    const trimmedCvLink = profileForm.cvLink.trim();
    if (trimmedCvLink && !isValidUrl(trimmedCvLink)) {
      setProfileMessage("cvLink phải là URL hợp lệ, ví dụ https://example.com/cv");
      setIsSavingProfile(false);
      return;
    }

    try {
      const response = await updateCandidateProfile(auth.token, {
        fullName: profileForm.fullName.trim(),
        phone: profileForm.phone.trim() || null,
        bio: profileForm.bio.trim() || null,
        cvLink: trimmedCvLink || null,
      });

      setProfile(response.item);
      setProfileForm(toProfileForm(response.item));
      setProfileMessage("Profile updated successfully.");

      if (auth.user.fullName !== response.item.fullName) {
        setAuthState({
          token: auth.token,
          user: {
            ...auth.user,
            fullName: response.item.fullName,
          },
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Cannot update profile";
      setProfileMessage(message);
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function reloadCvs() {
    if (!auth?.token) return;
    const response = await listCandidateCvs(auth.token);
    setCvs(response.items);
  }

  function onEditCv(item: CandidateCv) {
    setEditingCvId(item.id);
    setCvForm({
      title: item.title,
      cvUrl: item.cvUrl,
      summary: item.summary || "",
      isDefault: item.isDefault,
    });
    setCvMessage("");
  }

  function resetCvForm() {
    setEditingCvId(null);
    setCvForm(EMPTY_CV_FORM);
  }

  async function onSubmitCv(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth?.token) return;

    setIsSavingCv(true);
    setCvMessage("");

    const trimmedCvUrl = cvForm.cvUrl.trim();
    if (!isValidUrl(trimmedCvUrl)) {
      setCvMessage("CV URL phải là link hợp lệ, ví dụ https://example.com/cv");
      setIsSavingCv(false);
      return;
    }

    try {
      if (editingCvId) {
        await updateCandidateCv(auth.token, editingCvId, {
          title: cvForm.title.trim(),
          cvUrl: trimmedCvUrl,
          summary: cvForm.summary.trim() || null,
          isDefault: cvForm.isDefault,
        });
        setCvMessage("CV updated successfully.");
      } else {
        await createCandidateCv(auth.token, {
          title: cvForm.title.trim(),
          cvUrl: trimmedCvUrl,
          summary: cvForm.summary.trim() || undefined,
          isDefault: cvForm.isDefault,
        });
        setCvMessage("CV created successfully.");
      }

      await reloadCvs();
      resetCvForm();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Cannot save CV";
      setCvMessage(message);
    } finally {
      setIsSavingCv(false);
    }
  }

  async function onDeleteCv(item: CandidateCv) {
    if (!auth?.token) return;
    const confirmed = window.confirm(
      `Delete CV \"${item.title}\"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    setDeletingId(item.id);
    setCvMessage("");
    try {
      await deleteCandidateCv(auth.token, item.id);
      await reloadCvs();
      if (editingCvId === item.id) {
        resetCvForm();
      }
      setCvMessage("CV deleted successfully.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Cannot delete CV";
      setCvMessage(message);
    } finally {
      setDeletingId(null);
    }
  }

  async function onSetDefaultCv(item: CandidateCv) {
    if (!auth?.token) return;
    setSettingDefaultId(item.id);
    setCvMessage("");
    try {
      await setDefaultCandidateCv(auth.token, item.id);
      await reloadCvs();
      setCvMessage(`Set \"${item.title}\" as default CV.`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Cannot set default CV";
      setCvMessage(message);
    } finally {
      setSettingDefaultId(null);
    }
  }

  if (!isReady) {
    return <p className="rounded-2xl bg-white p-4 shadow">Loading session...</p>;
  }

  if (!auth) {
    return (
      <p className="rounded-2xl bg-white p-4 shadow">
        Please login as CANDIDATE to manage profile and CVs.
      </p>
    );
  }

  if (auth.user.role !== "CANDIDATE") {
    return (
      <p className="rounded-2xl bg-white p-4 shadow">
        Forbidden for role {auth.user.role}. Login as CANDIDATE to use this
        page.
      </p>
    );
  }

  return (
    <section className="space-y-6">
      <article className="rounded-3xl bg-white p-6 shadow-lg">
        <h1 className="text-2xl font-black text-slate-900">Candidate Profile</h1>
        <p className="mt-1 text-sm text-slate-600">
          Update your personal profile for recruiter-facing information.
        </p>

        {isLoading ? (
          <p className="mt-3 text-sm text-slate-600">Loading profile...</p>
        ) : null}

        <form className="mt-5 space-y-3" onSubmit={onSubmitProfile}>
          <input
            name="fullName"
            value={profileForm.fullName}
            onChange={(event) =>
              setProfileForm((prev) => ({
                ...prev,
                fullName: event.target.value,
              }))
            }
            placeholder="Full name"
            className="w-full rounded-xl border px-3 py-2 text-sm"
            disabled={isLoading || isSavingProfile}
            required
          />
          <input
            name="phone"
            value={profileForm.phone}
            onChange={(event) =>
              setProfileForm((prev) => ({
                ...prev,
                phone: event.target.value,
              }))
            }
            placeholder="Phone number"
            className="w-full rounded-xl border px-3 py-2 text-sm"
            disabled={isLoading || isSavingProfile}
          />
          <input
            name="cvLink"
            value={profileForm.cvLink}
            onChange={(event) =>
              setProfileForm((prev) => ({
                ...prev,
                cvLink: event.target.value,
              }))
            }
            placeholder="Primary CV link"
            className="w-full rounded-xl border px-3 py-2 text-sm"
            disabled={isLoading || isSavingProfile}
          />
          <textarea
            name="bio"
            value={profileForm.bio}
            onChange={(event) =>
              setProfileForm((prev) => ({
                ...prev,
                bio: event.target.value,
              }))
            }
            placeholder="Short bio"
            className="h-28 w-full rounded-xl border px-3 py-2 text-sm"
            disabled={isLoading || isSavingProfile}
          />
          <button
            type="submit"
            disabled={isLoading || isSavingProfile}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isSavingProfile ? "Saving..." : "Save Profile"}
          </button>
        </form>

        {profile?.email ? (
          <p className="mt-3 text-xs text-slate-500">
            Account email: {profile.email}
          </p>
        ) : null}
        {profileMessage ? (
          <p className="mt-3 text-sm font-medium text-slate-700">
            {profileMessage}
          </p>
        ) : null}
      </article>

      <article className="rounded-3xl bg-white p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-black text-slate-900">CV Manager</h2>
            <p className="text-sm text-slate-600">
              View, create, edit, delete, and set default CV.
            </p>
          </div>
          {editingCvId ? (
            <button
              type="button"
              onClick={resetCvForm}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            >
              Cancel Edit
            </button>
          ) : null}
        </div>

        <form className="mt-4 grid gap-3" onSubmit={onSubmitCv}>
          <input
            name="title"
            value={cvForm.title}
            onChange={(event) =>
              setCvForm((prev) => ({ ...prev, title: event.target.value }))
            }
            placeholder="CV title"
            className="w-full rounded-xl border px-3 py-2 text-sm"
            disabled={isSavingCv}
            required
          />
          <input
            name="cvUrl"
            value={cvForm.cvUrl}
            onChange={(event) =>
              setCvForm((prev) => ({ ...prev, cvUrl: event.target.value }))
            }
            placeholder="CV URL"
            className="w-full rounded-xl border px-3 py-2 text-sm"
            disabled={isSavingCv}
            required
          />
          <textarea
            name="summary"
            value={cvForm.summary}
            onChange={(event) =>
              setCvForm((prev) => ({ ...prev, summary: event.target.value }))
            }
            placeholder="Optional summary"
            className="h-24 w-full rounded-xl border px-3 py-2 text-sm"
            disabled={isSavingCv}
          />
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={cvForm.isDefault}
              onChange={(event) =>
                setCvForm((prev) => ({
                  ...prev,
                  isDefault: event.target.checked,
                }))
              }
              disabled={isSavingCv}
            />
            Set as default CV
          </label>
          <button
            type="submit"
            disabled={isSavingCv}
            className="w-fit rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isSavingCv
              ? "Saving..."
              : editingCvId
                ? "Update CV"
                : "Create CV"}
          </button>
        </form>

        {cvs.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-slate-300 p-3 text-sm text-slate-600">
            No CV yet. Create your first CV to start applying faster.
          </p>
        ) : (
          <div className="mt-5 space-y-3">
            {cvs.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 p-4 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <a
                      href={item.cvUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-700 underline"
                    >
                      {item.cvUrl}
                    </a>
                  </div>
                  {item.isDefault ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                      DEFAULT
                    </span>
                  ) : null}
                </div>

                {item.summary ? (
                  <p className="mt-2 whitespace-pre-wrap text-slate-600">
                    {item.summary}
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-3 py-1.5"
                    onClick={() => onEditCv(item)}
                    disabled={isSavingCv}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-60"
                    onClick={() => onSetDefaultCv(item)}
                    disabled={item.isDefault || settingDefaultId === item.id}
                  >
                    {settingDefaultId === item.id ? "Setting..." : "Set Default"}
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-rose-300 px-3 py-1.5 text-rose-700 disabled:opacity-60"
                    onClick={() => onDeleteCv(item)}
                    disabled={deletingId === item.id}
                  >
                    {deletingId === item.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {cvMessage ? (
          <p className="mt-4 text-sm font-medium text-slate-700">{cvMessage}</p>
        ) : null}
      </article>
    </section>
  );
}