import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const classes =
  "glow-pulse inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] border border-violet-300/40 bg-violet-600/35 px-5 py-2.5 text-sm font-medium text-violet-50 shadow-[0_0_24px_rgba(168,85,247,0.32)] transition hover:border-violet-200/70 hover:bg-violet-500/45 hover:shadow-[0_0_34px_rgba(168,85,247,0.55)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
};

export function GlowButton({ children, className, ...props }: ButtonProps) {
  return (
    <button className={cn(classes, className)} {...props}>
      {children}
    </button>
  );
}

export function GlowLink({ children, className, href, ...props }: LinkProps) {
  return (
    <Link className={cn(classes, className)} href={href} {...props}>
      {children}
    </Link>
  );
}
