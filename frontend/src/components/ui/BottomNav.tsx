"use client";

import { BookOpen, Home, Map, Settings, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "ホーム", icon: Home },
  { href: "/map", label: "地図", icon: Map },
  { href: "/spots", label: "図鑑", icon: BookOpen },
  { href: "/achievements", label: "称号", icon: Sparkles },
  { href: "/login", label: "旅人", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-3xl rounded-[8px] border border-violet-300/20 bg-slate-950/72 px-2 py-2 shadow-[0_0_38px_rgba(30,41,59,0.8)] backdrop-blur-xl">
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-14 flex-col items-center justify-center gap-1 rounded-[6px] text-[11px] text-slate-300 transition hover:bg-violet-500/18 hover:text-white",
                active && "bg-violet-500/22 text-white shadow-[inset_0_0_18px_rgba(168,85,247,0.22)]",
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
