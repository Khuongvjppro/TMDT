"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  createMyAlertRule,
  deleteMyAlertRule,
  listMyAlertNotifications,
  listMyAlertRules,
  markAllMyAlertNotificationsAsRead,
  markMyAlertNotificationAsRead,
  runMyAlertMatchingNow,
  updateMyAlertRule,
} from "../../../lib/api";
import { useAuth } from "../../../components/auth-provider";
import { AlertNotificationItem, JobAlertRule, JobType } from "../../../types";

const jobTypeOptions: Array<{ value: JobType; label: string }> = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "INTERN", label: "Intern" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "REMOTE", label: "Remote" },
];

type AlertRuleFormState = {
  keyword: string;
  location: string;
  type: string;
  minSalary: string;
  maxExperienceYears: string;
  isActive: boolean;
};

const EMPTY_RULE_FORM: AlertRuleFormState = {
  keyword: "",
  location: "",
  type: "",
  minSalary: "",
  maxExperienceYears: "",
  isActive: true,
};

function formatDate(value?: string | null) {
  if (!value) return "Never";
  return new Date(value).toLocaleString();
}

export default function CandidateAlertsPage() {
  const { auth, isReady } = useAuth();
  const [rules, setRules] = useState<JobAlertRule[]>([]);
  const [notifications, setNotifications] = useState<AlertNotificationItem[]>([]);
  const [ruleForm, setRuleForm] = useState<AlertRuleFormState>(EMPTY_RULE_FORM);

  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingRule, setIsCreatingRule] = useState(false);
  const [isRunningMatch, setIsRunningMatch] = useState(false);
  const [markingNotificationId, setMarkingNotificationId] = useState<number | null>(null);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [message, setMessage] = useState("");

  async function loadData(token: string, onlyUnread = unreadOnly) {
    setIsLoading(true);
    setMessage("");
    try {
      const [rulesRes, notificationsRes] = await Promise.all([
        listMyAlertRules(token),
        listMyAlertNotifications(token, {
          onlyUnread,
          pageSize: 50,
        }),
      ]);
      setRules(rulesRes.items);
      setNotifications(notificationsRes.items);
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Cannot load alerts";
      setMessage(nextMessage);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!auth?.token || auth.user.role !== "CANDIDATE") return;
    loadData(auth.token, unreadOnly);
  }, [auth?.token, auth?.user.role, unreadOnly]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications],
  );

  async function onCreateRule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth?.token) return;

    setIsCreatingRule(true);
    setMessage("");
    try {
      const parsedMinSalary = Number(ruleForm.minSalary);
      const parsedMaxExp = Number(ruleForm.maxExperienceYears);

      await createMyAlertRule(auth.token, {
        keyword: ruleForm.keyword.trim() || undefined,
        location: ruleForm.location.trim() || undefined,
        type: ruleForm.type || undefined,
        minSalary:
          Number.isFinite(parsedMinSalary) && parsedMinSalary > 0
            ? parsedMinSalary
            : undefined,
        maxExperienceYears:
          Number.isFinite(parsedMaxExp) && parsedMaxExp >= 0 ? parsedMaxExp : undefined,
        isActive: ruleForm.isActive,
      });

      setRuleForm(EMPTY_RULE_FORM);
      await loadData(auth.token, unreadOnly);
      setMessage("Alert rule created.");
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Cannot create alert rule";
      setMessage(nextMessage);
    } finally {
      setIsCreatingRule(false);
    }
  }

  async function onToggleRule(alert: JobAlertRule) {
    if (!auth?.token) return;

    try {
      await updateMyAlertRule(auth.token, alert.id, {
        isActive: !alert.isActive,
      });
      await loadData(auth.token, unreadOnly);
      setMessage(`Rule ${alert.isActive ? "deactivated" : "activated"}.`);
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Cannot update alert rule";
      setMessage(nextMessage);
    }
  }

  async function onDeleteRule(alert: JobAlertRule) {
    if (!auth?.token) return;

    const confirmed = window.confirm("Delete this alert rule?");
    if (!confirmed) return;

    try {
      await deleteMyAlertRule(auth.token, alert.id);
      await loadData(auth.token, unreadOnly);
      setMessage("Alert rule deleted.");
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Cannot delete alert rule";
      setMessage(nextMessage);
    }
  }

  async function onRunMatchingNow() {
    if (!auth?.token) return;

    setIsRunningMatch(true);
    setMessage("");
    try {
      const response = await runMyAlertMatchingNow(auth.token);
      await loadData(auth.token, unreadOnly);
      setMessage(
        `Matching done: rules=${response.item.processedRules}, matched=${response.item.matchedJobs}, notifications=${response.item.createdNotifications}`,
      );
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Cannot run alert matching";
      setMessage(nextMessage);
    } finally {
      setIsRunningMatch(false);
    }
  }

  async function onMarkRead(notificationId: number) {
    if (!auth?.token) return;

    setMarkingNotificationId(notificationId);
    try {
      await markMyAlertNotificationAsRead(auth.token, notificationId);
      await loadData(auth.token, unreadOnly);
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Cannot mark notification";
      setMessage(nextMessage);
    } finally {
      setMarkingNotificationId(null);
    }
  }

  async function onMarkAllRead() {
    if (!auth?.token) return;

    setIsMarkingAllRead(true);
    setMessage("");
    try {
      const response = await markAllMyAlertNotificationsAsRead(auth.token);
      await loadData(auth.token, unreadOnly);
      setMessage(`Marked ${response.item.updatedCount} notifications as read.`);
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Cannot mark notifications";
      setMessage(nextMessage);
    } finally {
      setIsMarkingAllRead(false);
    }
  }

  if (!isReady) {
    return <p className="rounded-2xl bg-white p-4 shadow">Loading session...</p>;
  }

  if (!auth) {
    return (
      <p className="rounded-2xl bg-white p-4 shadow">
        Please login as CANDIDATE to manage alerts.
      </p>
    );
  }

  if (auth.user.role !== "CANDIDATE") {
    return (
      <p className="rounded-2xl bg-white p-4 shadow">
        Forbidden for role {auth.user.role}. Login as CANDIDATE to use this page.
      </p>
    );
  }

  return (
    <section className="space-y-6">
      <article className="rounded-3xl bg-white p-6 shadow-lg">
        <h1 className="text-2xl font-black text-slate-900">Job Alerts</h1>
        <p className="mt-1 text-sm text-slate-600">
          Create matching rules. Scheduler will scan jobs and create notifications.
        </p>

        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={onCreateRule}>
          <input
            value={ruleForm.keyword}
            onChange={(event) =>
              setRuleForm((prev) => ({ ...prev, keyword: event.target.value }))
            }
            placeholder="Keyword (title/company)"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            value={ruleForm.location}
            onChange={(event) =>
              setRuleForm((prev) => ({ ...prev, location: event.target.value }))
            }
            placeholder="Location"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={ruleForm.type}
            onChange={(event) =>
              setRuleForm((prev) => ({ ...prev, type: event.target.value }))
            }
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Any job type</option>
            {jobTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            value={ruleForm.minSalary}
            onChange={(event) =>
              setRuleForm((prev) => ({ ...prev, minSalary: event.target.value }))
            }
            placeholder="Min salary"
            type="number"
            min={1}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            value={ruleForm.maxExperienceYears}
            onChange={(event) =>
              setRuleForm((prev) => ({ ...prev, maxExperienceYears: event.target.value }))
            }
            placeholder="Max experience years"
            type="number"
            min={0}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={ruleForm.isActive}
              onChange={(event) =>
                setRuleForm((prev) => ({ ...prev, isActive: event.target.checked }))
              }
            />
            Active rule
          </label>

          <div className="md:col-span-2 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={isCreatingRule}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isCreatingRule ? "Creating..." : "Create Rule"}
            </button>
            <button
              type="button"
              onClick={onRunMatchingNow}
              disabled={isRunningMatch}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm"
            >
              {isRunningMatch ? "Running..." : "Run Matching Now"}
            </button>
          </div>
        </form>
      </article>

      <article className="rounded-3xl bg-white p-6 shadow-lg">
        <h2 className="text-xl font-bold text-slate-900">My Alert Rules ({rules.length})</h2>
        <div className="mt-4 space-y-3">
          {rules.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
              No rules yet. Create your first alert rule above.
            </p>
          ) : null}

          {rules.map((rule) => (
            <article key={rule.id} className="rounded-2xl border border-slate-200 p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-900">
                  {rule.keyword || "Any keyword"} • {rule.location || "Any location"}
                </p>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    rule.isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {rule.isActive ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                Type: {rule.type || "ANY"} | Min salary: {rule.minSalary ?? "-"} | Max exp:
                {" "}
                {rule.maxExperienceYears ?? "-"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Last checked: {formatDate(rule.lastCheckedAt)}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onToggleRule(rule)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5"
                >
                  {rule.isActive ? "Deactivate" : "Activate"}
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteRule(rule)}
                  className="rounded-lg border border-rose-300 px-3 py-1.5 text-rose-700"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </article>

      <article className="rounded-3xl bg-white p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-900">
            Notifications ({notifications.length})
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm text-slate-700">
              <input
                className="mr-2"
                type="checkbox"
                checked={unreadOnly}
                onChange={(event) => setUnreadOnly(event.target.checked)}
              />
              Only unread
            </label>
            <button
              type="button"
              onClick={onMarkAllRead}
              disabled={isMarkingAllRead || unreadCount === 0}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-60"
            >
              {isMarkingAllRead ? "Marking..." : "Mark all read"}
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {notifications.length === 0 && !isLoading ? (
            <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
              No notifications yet.
            </p>
          ) : null}

          {notifications.map((item) => (
            <article
              key={item.id}
              className={`rounded-2xl border p-4 text-sm ${
                item.isRead ? "border-slate-200" : "border-amber-200 bg-amber-50/50"
              }`}
            >
              <p className="font-semibold text-slate-900">{item.message}</p>
              <p className="mt-1 text-xs text-slate-600">
                {item.job.companyName} • {item.job.location} • {item.job.type.replace("_", " ")}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {formatDate(item.createdAt)}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={`/jobs/${item.jobId}`}
                  className="rounded-lg border border-slate-300 px-3 py-1.5"
                >
                  View Job
                </Link>
                {!item.isRead ? (
                  <button
                    type="button"
                    onClick={() => onMarkRead(item.id)}
                    disabled={markingNotificationId === item.id}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-60"
                  >
                    {markingNotificationId === item.id ? "Updating..." : "Mark Read"}
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </article>

      {message ? (
        <p className="rounded-xl bg-white p-4 text-sm text-slate-700 shadow">{message}</p>
      ) : null}
    </section>
  );
}
