"use client";

import { FormEvent, useEffect, useState, useRef } from "react";
import { useAuth } from "./auth-provider";
import { listConversations, listMessages, sendMessage, API_BASE_URL } from "../lib/api";
import { ChatMessage, Conversation } from "../types";
import { io } from "socket.io-client";

export default function ChatWorkspace() {
  const { auth } = useAuth();
  const [rooms, setRooms] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState("");
  const [socket, setSocket] = useState<any>(null);
  const selectedRef = useRef<number | null>(null);

  async function loadRooms() {
    if (!auth?.token) return;
    try {
      const data = await listConversations(auth.token);
      setRooms(data.items);
      const requested = Number(new URLSearchParams(window.location.search).get("room"));
      setSelected((current) => current || (data.items.some((item) => item.id === requested) ? requested : data.items[0]?.id ?? null));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load conversations");
    }
  }

  async function loadMessages(roomId: number) {
    if (!auth?.token) return;
    try {
      setMessages((await listMessages(auth.token, roomId)).items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load messages");
    }
  }

  useEffect(() => {
    loadRooms();
  }, [auth?.token]);

  useEffect(() => {
    selectedRef.current = selected;
    if (selected) {
      loadMessages(selected);
    } else {
      setMessages([]);
    }
  }, [selected, auth?.token]);

  useEffect(() => {
    if (!auth?.token) return;

    const socketUrl = API_BASE_URL.replace("/api", "");
    const s = io(socketUrl, {
      auth: { token: auth.token },
    });

    s.on("new_message", (message: ChatMessage) => {
      // If the message is for the currently active room, update messages list
      if (selectedRef.current === message.conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }

      // Update room preview and move active room to the top
      setRooms((prevRooms) => {
        return prevRooms
          .map((r) => {
            if (r.id === message.conversationId) {
              return { ...r, messages: [message] };
            }
            return r;
          })
          .sort((a, b) => {
            const timeA = a.messages[0] ? new Date(a.messages[0].createdAt).getTime() : 0;
            const timeB = b.messages[0] ? new Date(b.messages[0].createdAt).getTime() : 0;
            const latestA = a.id === message.conversationId ? Date.now() : timeA;
            const latestB = b.id === message.conversationId ? Date.now() : timeB;
            return latestB - latestA;
          });
      });
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [auth?.token]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth?.token || !selected) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const content = String(data.get("content") || "").trim();
    if (!content) return;
    try {
      await sendMessage(auth.token, selected, content);
      form.reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to send the message");
    }
  }

  const room = rooms.find((item) => item.id === selected);
  return <div className="grid min-h-[540px] overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-[280px_1fr]">
    <aside className="border-r border-slate-200 bg-slate-50 p-3"><h2 className="px-3 py-2 font-black">Conversations</h2><div className="space-y-2">{rooms.map((item) => { const name = auth?.user.role === "EMPLOYER" ? item.candidate.fullName : item.employer.employerProfile?.companyName || item.employer.fullName; return <button key={item.id} onClick={() => setSelected(item.id)} className={`w-full rounded-2xl p-3 text-left ${selected === item.id ? "bg-blue-600 text-white" : "bg-white hover:bg-blue-50"}`}><p className="font-bold">{name}</p><p className="mt-1 truncate text-xs opacity-70">{item.messages[0]?.content || "Start a conversation"}</p></button>; })}</div>{!rooms.length ? <p className="p-3 text-sm text-slate-500">No conversations yet. Candidates can start one from the job search page.</p> : null}</aside>
    <section className="flex min-h-[540px] flex-col"><div className="border-b p-4"><h2 className="font-black">{room ? (auth?.user.role === "EMPLOYER" ? room.candidate.fullName : room.employer.employerProfile?.companyName || room.employer.fullName) : "Select a conversation"}</h2><p className="text-xs text-emerald-600">● Real-time chat connected</p></div><div className="flex-1 space-y-3 overflow-y-auto p-5">{messages.map((item) => { const mine = item.senderId === auth?.user.id; return <div key={item.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[75%] rounded-2xl px-4 py-3 ${mine ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-800"}`}><p className="text-sm">{item.content}</p><p className="mt-1 text-[10px] opacity-60">{new Date(item.createdAt).toLocaleString("en-US")}</p></div></div>; })}</div><form onSubmit={submit} className="flex gap-2 border-t p-4"><input name="content" disabled={!selected} autoComplete="off" placeholder="Type a message..." className="flex-1 rounded-xl border p-3"/><button disabled={!selected} className="rounded-xl bg-blue-600 px-5 font-bold text-white disabled:opacity-40">Send</button></form>{error ? <p className="px-4 pb-3 text-sm text-rose-600">{error}</p> : null}</section>
  </div>;
}
