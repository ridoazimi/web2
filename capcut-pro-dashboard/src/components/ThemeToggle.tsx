"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all"
      aria-label="Toggle Theme"
    >
      {theme === "light" ? <Moon size={20} className="text-slate-700" /> : <Sun size={20} className="text-amber-400" />}
    </button>
  );
}
