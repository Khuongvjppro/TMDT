const SAMPLE_LOGOS = [
  "/company-logos/logo-1.svg",
  "/company-logos/logo-2.svg",
  "/company-logos/logo-3.svg",
  "/company-logos/logo-4.svg",
  "/company-logos/logo-5.svg",
];

export function getCompanyLogoUrl(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash + name.charCodeAt(i)) % 997;
  }
  return SAMPLE_LOGOS[hash % SAMPLE_LOGOS.length];
}

export function formatSalaryRange(min?: number | null, max?: number | null) {
  if (min != null && max != null) return `${min}–${max}M VND`;
  if (min != null) return `From ${min}M VND`;
  if (max != null) return `Up to ${max}M VND`;
  return "Negotiable";
}

export function formatTimeAgo(dateString?: string | Date) {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0 || diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
