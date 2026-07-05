import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function completionRate(unlocked: number, total: number) {
  if (total === 0) {
    return 0;
  }

  return Math.round((unlocked / total) * 1000) / 10;
}
