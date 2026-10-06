"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import { cn } from "@/lib/cn";

type Props = {
  className?: string;
};

export function ThemeToggle({ className }: Props) {
  const { theme, toggleTheme, ready } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Passer en thème clair" : "Passer en thème sombre"}
      title={theme === "dark" ? "Thème clair" : "Thème sombre"}
      className={cn(
        "grid size-9 place-items-center rounded-full border border-frame text-mist-dim transition hover:border-spot/50 hover:text-spot",
        className,
      )}
    >
      {!ready ? (
        <span className="size-4 rounded-full bg-frame" aria-hidden />
      ) : theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
