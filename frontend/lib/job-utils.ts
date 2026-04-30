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

export function formatSalaryRange(_min?: number | null, _max?: number | null) {
  return "10 - 50 triệu";
}
