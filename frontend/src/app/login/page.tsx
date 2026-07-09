"use client";

import { FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { LogIn, UserPlus, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { login, register } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import { PageHeader } from "@/components/ui/PageHeader";

// 認証画面: ログインと新規登録を切り替え、取得したSanctumトークンをZustandに保存します。
export default function LoginPage() {
  const router = useRouter();
  const { user, setSession, clearSession } = useAuthStore();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("旅人");
  const [email, setEmail] = useState("traveler@example.com");
  const [password, setPassword] = useState("password");

  const mutation = useMutation({
    mutationFn: () => (mode === "login" ? login(email, password) : register(name, email, password)),
    onSuccess: (session) => {
      // ログイン成功後は全画面でAPI認証に使えるよう、トークンとユーザー情報を保存します。
      setSession(session.token, session.user);
      router.push("/collection");
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:px-8">
      <PageHeader title="旅人認証" subtitle="解放、称号、AI旅ガイドを使うための入口です。" />
      <GlassPanel glow className="p-6">
        {user ? (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-full border border-cyan-200/30 bg-cyan-500/10 text-cyan-100">
                <UserRound className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm text-slate-300">ログイン中</p>
                <h2 className="text-xl font-semibold text-white">{user.name}</h2>
              </div>
            </div>
            <GlowButton onClick={clearSession}>ログアウト</GlowButton>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-2 rounded-[8px] border border-violet-300/20 bg-slate-950/42 p-1">
              {(["login", "register"] as const).map((item) => (
                <button
                  className={cn(
                    "min-h-10 rounded-[8px] text-sm text-slate-300 transition",
                    mode === item && "bg-violet-500/30 text-white shadow-[0_0_18px_rgba(168,85,247,0.24)]",
                  )}
                  key={item}
                  onClick={() => {
                    // デモログインと新規登録の入力値が混ざらないように、モード変更時に初期値を調整します。
                    setMode(item);
                    mutation.reset();
                    if (item === "register" && email === "traveler@example.com") {
                      setEmail("");
                      setPassword("");
                    }
                    if (item === "login") {
                      setEmail("traveler@example.com");
                      setPassword("password");
                    }
                  }}
                  type="button"
                >
                  {item === "login" ? "ログイン" : "新規登録"}
                </button>
              ))}
            </div>
            {mode === "register" ? (
              <label className="block">
                <span className="text-sm text-slate-300">旅人名</span>
                <input
                  className="mt-2 min-h-12 w-full rounded-[8px] border border-violet-300/20 bg-slate-950/55 px-4 text-white outline-none transition focus:border-violet-200/70"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  type="text"
                />
              </label>
            ) : null}
            <label className="block">
              <span className="text-sm text-slate-300">メールアドレス</span>
              <input
                className="mt-2 min-h-12 w-full rounded-[8px] border border-violet-300/20 bg-slate-950/55 px-4 text-white outline-none transition focus:border-violet-200/70"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-300">パスワード</span>
              <input
                className="mt-2 min-h-12 w-full rounded-[8px] border border-violet-300/20 bg-slate-950/55 px-4 text-white outline-none transition focus:border-violet-200/70"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
              />
            </label>
            <GlowButton className="w-full" disabled={mutation.isPending}>
              {mode === "login" ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              {mutation.isPending ? "接続中..." : mode === "login" ? "ログイン" : "新規登録して始める"}
            </GlowButton>
            {mutation.isError ? (
              <p className="text-sm text-rose-200">
                {mode === "login"
                  ? "ログインに失敗しました。メールアドレスとパスワードを確認してください。"
                  : "登録に失敗しました。パスワードは8文字以上、メールアドレスは未使用のものを入力してください。"}
              </p>
            ) : null}
          </form>
        )}
      </GlassPanel>
    </main>
  );
}
