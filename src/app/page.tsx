"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  text: string;
};

export default function Home() {
  const [dark, setDark] = useState(true);
  const [userName, setUserName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() && !file) return;

    const userMsg: Message = {
      role: "user",
      text: input.trim() || (file ? `[Uploaded: ${file.name}]` : ""),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const formData = new FormData();
      if (userMsg.text && !file) formData.append("message", userMsg.text);
      if (file) formData.append("file", file);
      formData.append("history", JSON.stringify(messages));

      const res = await fetch("/api/chat", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages((prev) => [...prev, { role: "assistant", text: data.response }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: "assistant", text: err.message }]);
    } finally {
      setLoading(false);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => chatInputRef.current?.focus(), 0);
    }
  }

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const nameRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (mounted && nameRef.current) nameRef.current.focus(); }, [mounted]);

  if (!userName) {
    return (
      <div className="flex flex-col h-dvh items-center justify-center px-6 bg-background relative">
        <button
          onClick={() => setDark(!dark)}
          className="absolute top-4 right-6 p-2 text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-110"
          title="Toggle theme"
        >
          {dark ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          )}
        </button>
        <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mb-6 animate-scale-in">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-foreground mb-2 animate-fade-in">Welcome to your Syllabus Reality</h1>
        <p className="text-muted-foreground text-sm mb-8 animate-fade-in">Enter your name to get started.</p>
        <form
          onSubmit={(e) => { e.preventDefault(); if (nameInput.trim()) setUserName(nameInput.trim()); }}
          className="flex items-center gap-3 bg-card rounded-2xl px-4 py-3 w-full max-w-sm border border-input focus-within:border-ring/30 transition-all duration-300 animate-slide-up"
        >
          <input
            ref={nameRef}
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Your name..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none"
          />
          <button
            type="submit"
            disabled={!nameInput.trim()}
            suppressHydrationWarning
            className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh bg-background">
      <header className="flex items-center gap-3 w-[88%] max-w-7xl mx-auto px-4 py-4 border-b border-border">
        <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="text-sm font-medium text-foreground">Syllabus Reality</span>
        <button
          onClick={() => setDark(!dark)}
          className="ml-auto p-2 text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-110"
          title="Toggle theme"
        >
          {dark ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          )}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        {loading && <div className="h-0.5 bg-border animate-fade-in"><div className="h-full bg-foreground/40 animate-pulse rounded-full w-1/2 mx-auto" /></div>}
        <div className="w-[88%] max-w-7xl mx-auto px-4 pt-10 pb-6 space-y-5">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[55vh] text-center">
              <p className="text-sm text-muted-foreground">What are we studying today, {userName}?</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`animate-slide-up flex gap-3 items-start ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              {msg.role === "assistant" ? (
                <div className="w-8 h-8 shrink-0 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mt-1">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
              ) : (
                <div className="w-8 h-8 shrink-0 rounded-xl bg-border flex items-center justify-center mt-1">
                  <span className="text-xs font-semibold text-foreground">{userName[0].toUpperCase()}</span>
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl text-sm leading-7 whitespace-pre-wrap px-4 py-3 ${
                  msg.role === "assistant"
                    ? "bg-card border border-border text-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 shrink-0 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mt-1">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="bg-card border border-border rounded-2xl px-4 py-3 animate-scale-in">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce [animation-delay:0.12s]" />
                  <span className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce [animation-delay:0.24s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="bg-background">
        <div className="w-[88%] max-w-7xl mx-auto px-4 pb-5">
          {file && (
            <div className="flex items-center gap-2 mb-3 px-3.5 py-2 text-xs text-muted-foreground bg-card rounded-xl border border-border">
              <span className="truncate">{file.name}</span>
              <button
                onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
              >
                &times;
              </button>
            </div>
          )}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-3 bg-card rounded-2xl px-4 py-3 border border-input focus-within:border-ring/30 transition-all duration-300"
          >
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-0.5 text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.txt"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              ref={chatInputRef}
              placeholder={`Ask anything, ${userName}...`}
              className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || (!input.trim() && !file)}
              className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all shrink-0"
            >
              {loading ? (
                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
