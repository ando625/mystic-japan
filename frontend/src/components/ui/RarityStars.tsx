import { Star } from "lucide-react";

export function RarityStars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1 text-cyan-100" aria-label={`レア度 ${value}`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={index < value ? "h-4 w-4 fill-violet-300 text-violet-200" : "h-4 w-4 text-slate-500"}
        />
      ))}
    </div>
  );
}
