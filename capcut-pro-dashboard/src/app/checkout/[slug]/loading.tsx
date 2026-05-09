"use client";

import React from "react";
import { Loader2, ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";

export default function CheckoutLoading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--bg-primary)]">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--accent-glow)] opacity-20 blur-[120px] pointer-events-none"></div>
      
      <div className="relative flex flex-col items-center">
        {/* Logo Pulsing */}
        <div className="relative w-24 h-24 mb-8 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-2xl blur-xl opacity-20"></div>
          <div className="relative w-full h-full rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center p-4 overflow-hidden shadow-2xl">
             <Image 
                src="/images/logo.png" 
                alt="Logo" 
                width={60} 
                height={60} 
                className="object-contain"
             />
          </div>
        </div>

        {/* Loading Text */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-white font-black text-xl tracking-tight">
            <Loader2 className="animate-spin text-amber-500" size={20} />
            <span>Menyiapkan Checkout</span>
          </div>
          <p className="text-[var(--text-muted)] text-sm animate-bounce">Mohon tunggu sebentar...</p>
        </div>

        {/* Features list (mini) */}
        <div className="mt-12 flex gap-6 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={12} className="text-emerald-500" />
            <span>Secure Payment</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles size={12} className="text-amber-500" />
            <span>Instant Delivery</span>
          </div>
        </div>
      </div>
      
      {/* Bottom Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-[var(--border-color)]">
        <div className="h-full bg-gradient-to-r from-amber-500 via-orange-600 to-amber-500 w-1/3 animate-loading-bar shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
      </div>

      <style jsx global>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        .animate-loading-bar {
          animation: loading-bar 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
