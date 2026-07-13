"use client";

import { getCompanyLogoUrl } from "../lib/job-utils";

type Props = {
  companyName: string;
  size?: "sm" | "md" | "lg";
};

export default function CompanyLogo({ companyName, size = "md" }: Props) {
  const initials = companyName ? companyName.substring(0, 2).toUpperCase() : "CO";

  const sizeClasses = {
    sm: {
      container: "h-12 w-12 rounded-2xl",
      img: "h-10 w-10 rounded-xl",
      fallback: "text-xs rounded-xl"
    },
    md: {
      container: "h-14 w-14 rounded-2xl",
      img: "h-12 w-12 rounded-xl",
      fallback: "text-sm rounded-xl"
    },
    lg: {
      container: "h-16 w-16 rounded-2xl",
      img: "h-14 w-14 rounded-xl",
      fallback: "text-sm rounded-xl"
    }
  };

  const classes = sizeClasses[size];

  return (
    <div className={`flex shrink-0 items-center justify-center border border-slate-100 bg-slate-50 shadow-inner ${classes.container}`}>
      <img
        src={getCompanyLogoUrl(companyName)}
        alt={`${companyName} logo`}
        className={`${classes.img} object-cover`}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          const parent = e.currentTarget.parentElement;
          if (parent) {
            // Check if fallback already exists to prevent duplicate renders
            if (parent.querySelector('.company-logo-fallback')) return;
            const fallback = document.createElement('div');
            fallback.className = `company-logo-fallback flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-500 to-indigo-600 font-black text-white ${classes.fallback}`;
            fallback.innerText = initials;
            parent.appendChild(fallback);
          }
        }}
        loading="lazy"
      />
    </div>
  );
}
