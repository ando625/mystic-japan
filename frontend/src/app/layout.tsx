import type { Metadata } from "next";
import "./globals.css";
import { AppBgmPlayer } from "@/components/audio/AppBgmPlayer";
import { BottomNav } from "@/components/ui/BottomNav";
import { MysticBackground } from "@/components/ui/MysticBackground";
import { Providers } from "@/app/providers";

export const metadata: Metadata = {
  title: "日本神秘紀行",
  description: "神々の記憶を巡る和風ファンタジーWebアプリ",
};

// 全ページ共通の土台です。背景、BGMプレイヤー、下部ナビはここで一度だけ配置します。
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className="h-full antialiased"
    >
      <body className="min-h-full bg-[#050816] text-slate-100">
        <Providers>
          <MysticBackground />
          <div className="min-h-screen pb-24">{children}</div>
          <AppBgmPlayer />
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
