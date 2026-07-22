"use client";

import Link from "next/link";
import React, { ComponentProps } from "react";
import { useTransitionRouter } from "./transition-provider";

type LinkProps = ComponentProps<typeof Link>;

export function TransitionLink({ href, onClick, children, ...props }: LinkProps) {
  const router = useTransitionRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }

    // Check if it's a standard left-click without modifier keys
    const isModified = e.metaKey || e.altKey || e.ctrlKey || e.shiftKey;
    const isLocal = href.toString().startsWith("/") || href.toString().startsWith(".");
    const isTargetBlank = props.target === "_blank";

    if (!e.defaultPrevented && !isModified && isLocal && !isTargetBlank) {
      e.preventDefault();
      router.push(href.toString());
    }
  };

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
