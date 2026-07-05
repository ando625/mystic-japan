"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Bot, LogIn, Send, Sparkles, UserRound } from "lucide-react";
import Link from "next/link";
import { askAiGuide } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import type { Spot } from "@/types/domain";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";

type ChatMessage = {
  role: "user" | "guide";
  text: string;
};

export function AiGuideChat({ spot, compact = false }: { spot: Spot; compact?: boolean }) {
  const { token } = useAuthStore();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "guide",
      text: `${spot.name}の記憶へようこそ。神話、歴史、季節の見どころなど、気になることを尋ねてください。`,
    },
  ]);

  const suggestions = useMemo(
    () => [`${spot.name}の神話を教えて`, "おすすめの季節は？", "初めて行くなら何を見る？"],
    [spot.name],
  );

  const mutation = useMutation({
    mutationFn: (text: string) => {
      if (!token) {
        throw new Error("LOGIN_REQUIRED");
      }

      return askAiGuide(spot.id, text, token);
    },
    onSuccess: (response) => {
      setMessages((current) => [...current, { role: "guide", text: response.answer }]);
    },
    onError: (error) => {
      if (error instanceof Error && error.message === "LOGIN_REQUIRED") {
        return;
      }

      setMessages((current) => [
        ...current,
        {
          role: "guide",
          text: "今は星の通信が乱れています。GEMINI_API_KEYの設定やAPI接続を確認して、もう一度お試しください。",
        },
      ]);
    },
  });

  function submit(text = message) {
    const trimmed = text.trim();

    if (!trimmed || mutation.isPending) {
      return;
    }

    setMessages((current) => [...current, { role: "user", text: trimmed }]);
    setMessage("");
    mutation.mutate(trimmed);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit();
  }

  return (
    <GlassPanel glow className={compact ? "p-5" : "p-6"}>
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-full border border-cyan-200/25 bg-cyan-500/10 text-cyan-100">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.26em] text-cyan-100/65">AI Guide</p>
          <h2 className="text-xl font-semibold text-white">AI旅ガイド</h2>
        </div>
      </div>

      {!token ? (
        <div className="rounded-[8px] border border-violet-300/20 bg-slate-950/45 p-4">
          <p className="text-sm leading-7 text-slate-300">AI旅ガイドを使うにはログインが必要です。</p>
          <Link
            href="/login"
            className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-[8px] border border-violet-300/35 bg-violet-500/22 px-4 text-sm text-violet-50"
          >
            <LogIn className="h-4 w-4" />
            ログインへ
          </Link>
        </div>
      ) : (
        <>
          <div className={compact ? "max-h-72 space-y-3 overflow-y-auto pr-1" : "max-h-[520px] space-y-3 overflow-y-auto pr-1"}>
            {messages.map((item, index) => (
              <div key={`${item.role}-${index}`} className={item.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    item.role === "user"
                      ? "max-w-[86%] rounded-[8px] border border-violet-300/35 bg-violet-500/24 px-4 py-3 text-sm leading-7 text-white"
                      : "max-w-[92%] rounded-[8px] border border-cyan-200/20 bg-slate-950/52 px-4 py-3 text-sm leading-7 text-slate-200"
                  }
                >
                  <div className="mb-2 flex items-center gap-2 text-xs text-cyan-100/70">
                    {item.role === "user" ? <UserRound className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                    {item.role === "user" ? "あなた" : "旅ガイド"}
                  </div>
                  {item.text}
                </div>
              </div>
            ))}
            {mutation.isPending ? (
              <div className="rounded-[8px] border border-cyan-200/20 bg-slate-950/52 px-4 py-3 text-sm text-cyan-100">
                星図を読み解いています...
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {suggestions.map((item) => (
              <button
                key={item}
                className="min-h-9 rounded-[8px] border border-violet-300/20 bg-slate-950/38 px-3 text-xs text-slate-200 transition hover:bg-violet-500/20"
                onClick={() => submit(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>

          <form className="mt-4 flex gap-2" onSubmit={handleSubmit}>
            <input
              className="min-h-12 min-w-0 flex-1 rounded-[8px] border border-violet-300/20 bg-slate-950/55 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-200/70"
              maxLength={1000}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={`${spot.name}について質問...`}
              value={message}
            />
            <GlowButton className="min-w-12 px-4" disabled={mutation.isPending} aria-label="送信">
              <Send className="h-4 w-4" />
            </GlowButton>
          </form>
        </>
      )}
    </GlassPanel>
  );
}
