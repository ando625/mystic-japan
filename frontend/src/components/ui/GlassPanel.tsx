import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type GlassPanelProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  glow?: boolean;
};

export function GlassPanel({ children, className, glow = false, ...props }: GlassPanelProps) {
  return (
    <div
      className={cn(
        "rounded-[8px] border border-violet-300/20 bg-slate-950/48 shadow-[0_18px_70px_rgba(5,8,22,0.45)] backdrop-blur-xl",
        glow && "shadow-[0_0_34px_rgba(168,85,247,0.25),0_18px_70px_rgba(5,8,22,0.55)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
