"use client";

import { BookOpen, Home, Map, ScrollText, Settings, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "ホーム", icon: Home },
  { href: "/map", label: "地図", icon: Map },
  { href: "/spots", label: "図鑑", icon: BookOpen },
  { href: "/stamps", label: "御朱印", icon: ScrollText },
  { href: "/achievements", label: "称号", icon: Sparkles },
  { href: "/login", label: "旅人", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-2xl rounded-[8px] border border-white/10 bg-black/30 px-1.5 py-1.5 opacity-75 shadow-[0_0_24px_rgba(15,23,42,0.5)] backdrop-blur-md transition hover:opacity-95">
      <div className="grid grid-cols-6 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-11 flex-col items-center justify-center gap-0.5 rounded-[6px] text-[10px] text-slate-300 transition hover:bg-white/10 hover:text-white",
                active && "bg-white/12 text-white shadow-[inset_0_0_14px_rgba(168,85,247,0.16)]",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
