"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createChatConversation } from "../lib/api";
import { useAuth } from "./auth-provider";

type Props = {
  employerId: number;
  employerName: string;
};

export default function ChatWithEmployerButton({
  employerId,
  employerName,
}: Props) {
  const { auth, isReady } = useAuth();
  const router = useRouter();
  const [isOpening, setIsOpening] = useState(false);
  const [message, setMessage] = useState("");

  const canUse = Boolean(auth?.token) && auth?.user.role === "CANDIDATE";

  async function onOpenChat() {
    if (!auth?.token) return;

    setIsOpening(true);
    setMessage("");
    try {
      const response = await createChatConversation(auth.token, {
        participantId: employerId,
      });
      router.push(`/chat?conversation=${response.item.id}`);
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Cannot open chat";
      setMessage(nextMessage);
    } finally {
      setIsOpening(false);
    }
  }

  if (!isReady) {
    return null;
  }

  if (!canUse) {
    return null;
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onOpenChat}
        disabled={isOpening}
        className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60"
      >
        {isOpening ? "Opening chat..." : `Chat with ${employerName}`}
      </button>
      {message ? <p className="text-xs text-rose-600">{message}</p> : null}
    </div>
  );
}
