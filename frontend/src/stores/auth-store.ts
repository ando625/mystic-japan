"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/domain";

// ログイン状態を全画面で共有するためのZustand storeです。
// persistを使っているので、ページをリロードしてもlocalStorageから復元されます。
type AuthState = {
  // Laravel Sanctumから受け取ったBearerトークンです。API呼び出し時のAuthorizationヘッダーに使います。
  token: string | null;
  // ログイン中のユーザー情報です。画面上の表示やログイン判定に使います。
  user: User | null;
  // ログイン/新規登録成功時にトークンとユーザー情報を保存します。
  setSession: (token: string, user: User) => void;
  // ログアウト時にフロント側のログイン状態を空にします。
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (token, user) => set({ token, user }),
      clearSession: () => set({ token: null, user: null }),
    }),
    {
      // localStorageに保存されるキー名です。
      name: "mystic-japan-auth",
    },
  ),
);
