import { Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  className?: string;
};

export function AiBadge({ className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-spot/30 bg-spot/10 px-2.5 py-1 text-[10px] font-semibold tracking-[0.22em] text-spot uppercase",
        className,
      )}
    >
      <Sparkles className="h-3 w-3" />
      AI-Powered
    </span>
  );
}
