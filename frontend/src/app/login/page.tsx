"use client";

import { FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { LogIn, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import { PageHeader } from "@/components/ui/PageHeader";

export default function LoginPage() {
  const router = useRouter();
  const { user, setSession, clearSession } = useAuthStore();
  const [email, setEmail] = useState("traveler@example.com");
  const [password, setPassword] = useState("password");

  const mutation = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: (session) => {
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
              <LogIn className="h-4 w-4" />
              {mutation.isPending ? "接続中..." : "ログイン"}
            </GlowButton>
            {mutation.isError ? <p className="text-sm text-rose-200">ログインに失敗しました。</p> : null}
          </form>
        )}
      </GlassPanel>
    </main>
  );
}
