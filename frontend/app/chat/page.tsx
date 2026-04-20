"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  createChatConversation,
  listChatContacts,
  listChatConversations,
  listConversationMessages,
  sendConversationMessage,
} from "../../lib/api";
import { useAuth } from "../../components/auth-provider";
import { ChatContact, ChatConversation, ChatMessage } from "../../types";

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export default function ChatPage() {
  const { auth, isReady } = useAuth();
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(
    null,
  );
  const [selectedContactId, setSelectedContactId] = useState("");
  const [initialMessageInput, setInitialMessageInput] = useState("");
  const [messageInput, setMessageInput] = useState("");

  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [message, setMessage] = useState("");

  async function loadContacts(token: string) {
    try {
      const response = await listChatContacts(token);
      setContacts(response.items);
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Cannot load contacts";
      setMessage(nextMessage);
    }
  }

  async function loadConversations(token: string) {
    setIsLoadingConversations(true);
    try {
      const response = await listChatConversations(token);
      setConversations(response.items);
      setSelectedConversationId((prev) => {
        if (prev && response.items.some((item) => item.id === prev)) {
          return prev;
        }
        return response.items[0]?.id ?? null;
      });
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Cannot load conversations";
      setMessage(nextMessage);
    } finally {
      setIsLoadingConversations(false);
    }
  }

  async function loadMessages(token: string, conversationId: number) {
    setIsLoadingMessages(true);
    try {
      const response = await listConversationMessages(token, conversationId, {
        pageSize: 50,
      });
      setMessages(response.items);
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Cannot load messages";
      setMessage(nextMessage);
    } finally {
      setIsLoadingMessages(false);
    }
  }

  useEffect(() => {
    if (!auth?.token) return;
    loadContacts(auth.token);
    loadConversations(auth.token);
  }, [auth?.token]);

  useEffect(() => {
    if (!auth?.token || !selectedConversationId) {
      setMessages([]);
      return;
    }
    loadMessages(auth.token, selectedConversationId);
  }, [auth?.token, selectedConversationId]);

  useEffect(() => {
    if (!auth?.token || !selectedConversationId) return;

    const timer = setInterval(async () => {
      try {
        const latestMessageId = messages[messages.length - 1]?.id;
        const response = await listConversationMessages(auth.token, selectedConversationId, {
          afterId: latestMessageId,
          pageSize: 50,
        });

        if (latestMessageId) {
          if (response.items.length > 0) {
            setMessages((prev) => [...prev, ...response.items]);
          }
        } else {
          setMessages(response.items);
        }

        const refreshed = await listChatConversations(auth.token);
        setConversations(refreshed.items);
      } catch {
        // Keep polling resilient for basic chat flow.
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [auth?.token, selectedConversationId, messages]);

  async function onCreateConversation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth?.token) return;

    const selectedContact = contacts.find(
      (item) => String(item.id) === selectedContactId,
    );
    const participantId = selectedContact?.participantId;
    if (!participantId || !Number.isInteger(participantId) || participantId <= 0) {
      setMessage("Please select a contact");
      return;
    }

    setIsCreatingConversation(true);
    setMessage("");
    try {
      const response = await createChatConversation(auth.token, {
        participantId,
        initialMessage: initialMessageInput.trim() || undefined,
      });
      setSelectedContactId("");
      setInitialMessageInput("");
      await loadConversations(auth.token);
      setSelectedConversationId(response.item.id);
      setMessage("Conversation ready.");
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Cannot create conversation";
      setMessage(nextMessage);
    } finally {
      setIsCreatingConversation(false);
    }
  }

  async function onSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth?.token || !selectedConversationId) return;

    const content = messageInput.trim();
    if (!content) return;

    setIsSendingMessage(true);
    setMessage("");
    try {
      const response = await sendConversationMessage(
        auth.token,
        selectedConversationId,
        content,
      );
      setMessages((prev) => [...prev, response.item]);
      setMessageInput("");
      const refreshed = await listChatConversations(auth.token);
      setConversations(refreshed.items);
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Cannot send message";
      setMessage(nextMessage);
    } finally {
      setIsSendingMessage(false);
    }
  }

  const selectedConversation = useMemo(
    () =>
      conversations.find((conversation) => conversation.id === selectedConversationId) ||
      null,
    [conversations, selectedConversationId],
  );

  if (!isReady) {
    return <p className="rounded-2xl bg-white p-4 shadow">Loading session...</p>;
  }

  if (!auth) {
    return (
      <p className="rounded-2xl bg-white p-4 shadow">
        Please login to use chat.
      </p>
    );
  }

  if (auth.user.role !== "CANDIDATE" && auth.user.role !== "EMPLOYER") {
    return (
      <p className="rounded-2xl bg-white p-4 shadow">
        Forbidden for role {auth.user.role}. Only CANDIDATE and EMPLOYER can chat.
      </p>
    );
  }

  return (
    <section className="space-y-4">
      <article className="rounded-3xl bg-white p-6 shadow-lg">
        <h1 className="text-2xl font-black text-slate-900">1-1 Chat</h1>
        <p className="mt-1 text-sm text-slate-600">
          Basic polling chat between Candidate and Employer.
        </p>

        <form className="mt-4 grid gap-3 md:grid-cols-3" onSubmit={onCreateConversation}>
          <select
            value={selectedContactId}
            onChange={(event) => setSelectedContactId(event.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">
              {auth.user.role === "CANDIDATE"
                ? "Select company/employer"
                : "Select candidate"}
            </option>
            {contacts.map((contact) => (
              <option key={contact.id} value={String(contact.id)}>
                {contact.label} - {contact.email}
              </option>
            ))}
          </select>
          <input
            value={initialMessageInput}
            onChange={(event) => setInitialMessageInput(event.target.value)}
            placeholder="Optional first message"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm md:col-span-2"
          />
          <button
            type="submit"
            disabled={isCreatingConversation}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 md:col-span-3"
          >
            {isCreatingConversation ? "Creating..." : "Create / Open Conversation"}
          </button>
        </form>
      </article>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <article className="rounded-3xl bg-white p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Rooms</h2>
            <button
              type="button"
              onClick={() => auth?.token && loadConversations(auth.token)}
              disabled={isLoadingConversations}
              className="rounded-lg border border-slate-300 px-3 py-1 text-xs"
            >
              {isLoadingConversations ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div className="space-y-2">
            {conversations.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 p-3 text-sm text-slate-600">
                No conversations yet.
              </p>
            ) : null}

            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => setSelectedConversationId(conversation.id)}
                className={`w-full rounded-xl border p-3 text-left text-sm ${
                  selectedConversationId === conversation.id
                    ? "border-brand-500 bg-brand-50"
                    : "border-slate-200"
                }`}
              >
                <p className="font-semibold text-slate-900">
                  {conversation.peerUser.fullName}
                </p>
                <p className="mt-1 line-clamp-1 text-xs text-slate-600">
                  {conversation.lastMessage?.content || "No messages yet"}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {formatDate(conversation.updatedAt)}
                </p>
                {conversation.unreadCount > 0 ? (
                  <p className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                    {conversation.unreadCount} unread
                  </p>
                ) : null}
              </button>
            ))}
          </div>
        </article>

        <article className="rounded-3xl bg-white p-4 shadow-lg">
          {!selectedConversation ? (
            <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
              Select a conversation to view messages.
            </p>
          ) : (
            <>
              <div className="mb-3 border-b border-slate-200 pb-3">
                <h2 className="text-lg font-bold text-slate-900">
                  {selectedConversation.peerUser.fullName}
                </h2>
                <p className="text-xs text-slate-600">{selectedConversation.peerUser.email}</p>
              </div>

              <div className="h-[420px] space-y-2 overflow-y-auto rounded-xl bg-slate-50 p-3">
                {isLoadingMessages ? (
                  <p className="text-sm text-slate-600">Loading messages...</p>
                ) : null}

                {messages.length === 0 && !isLoadingMessages ? (
                  <p className="text-sm text-slate-600">No messages yet.</p>
                ) : null}

                {messages.map((item) => {
                  const mine = item.senderId === auth.user.id;
                  return (
                    <div
                      key={item.id}
                      className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                        mine
                          ? "ml-auto bg-slate-900 text-white"
                          : "bg-white text-slate-900"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{item.content}</p>
                      <p
                        className={`mt-1 text-[11px] ${
                          mine ? "text-slate-300" : "text-slate-500"
                        }`}
                      >
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <form className="mt-3 flex gap-2" onSubmit={onSendMessage}>
                <input
                  value={messageInput}
                  onChange={(event) => setMessageInput(event.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  disabled={isSendingMessage || !messageInput.trim()}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {isSendingMessage ? "Sending..." : "Send"}
                </button>
              </form>
            </>
          )}
        </article>
      </div>

      {message ? (
        <p className="rounded-xl bg-white p-4 text-sm text-slate-700 shadow">{message}</p>
      ) : null}
    </section>
  );
}
