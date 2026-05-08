"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyButton({ text, label = "Salin" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
        copied 
          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
          : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)]"
      }`}
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? "Tersalin!" : label}
    </button>
  );
}
