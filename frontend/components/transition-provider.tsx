"use client";

import React, { createContext, useContext, useTransition } from "react";
import { useRouter } from "next/navigation";

interface TransitionContextType {
  isPending: boolean;
  push: (href: string, options?: any) => void;
  replace: (href: string, options?: any) => void;
  back: () => void;
  forward: () => void;
}

const TransitionContext = createContext<TransitionContextType | null>(null);

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const push = (href: string, options?: any) => {
    startTransition(() => {
      router.push(href, options);
    });
  };

  const replace = (href: string, options?: any) => {
    startTransition(() => {
      router.replace(href, options);
    });
  };

  const back = () => {
    startTransition(() => {
      router.back();
    });
  };

  const forward = () => {
    startTransition(() => {
      router.forward();
    });
  };

  return (
    <TransitionContext.Provider value={{ isPending, push, replace, back, forward }}>
      {/* Styling for loading bar */}
      {isPending && (
        <>
          <style>{`
            @keyframes slideProgress {
              0% { transform: translateX(-100%); }
              50% { transform: translateX(-30%); }
              100% { transform: translateX(0%); }
            }
            .transition-loader-bar {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              height: 4px;
              z-index: 99999;
              background: linear-gradient(90deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%);
              background-size: 200% 100%;
              animation: slideProgress 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
              transform-origin: left;
              box-shadow: 0 1px 10px rgba(99, 102, 241, 0.5);
            }
            .transition-loader-overlay {
              position: fixed;
              inset: 0;
              z-index: 99998;
              background-color: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(1px);
              pointer-events: none;
            }
          `}</style>
          <div className="transition-loader-bar" />
          <div className="transition-loader-overlay" />
        </>
      )}
      {children}
    </TransitionContext.Provider>
  );
}

export function useTransitionRouter() {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error("useTransitionRouter must be used within a TransitionProvider");
  }
  return context;
}
