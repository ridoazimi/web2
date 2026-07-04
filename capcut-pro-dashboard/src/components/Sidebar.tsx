"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useMobileNav } from "@/context/MobileNavContext";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  Package,
  ShieldCheck,
  MessageSquare,
  Settings,
  Scissors,
  CalendarClock,
  UserPlus,
  RefreshCw,
  X,
  Lock,
  ClipboardList,
  ShoppingBag,
  Star,
} from "lucide-react";
import type { PermissionKey } from "@/lib/auth-shared";

// ─── Navigation config ────────────────────────────────────────────────────────

const navItems: { href: string; label: string; icon: React.ElementType; permission?: PermissionKey }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }, // Always visible
  { href: "/transactions", label: "Transaksi", icon: ArrowLeftRight, permission: "page_transactions" },
  { href: "/users", label: "Pelanggan", icon: Users, permission: "page_customers" },
  { href: "/stock", label: "Stok Akun", icon: Package, permission: "page_stock" },
  { href: "/dashboard/products", label: "Produk Marketplace", icon: ShoppingBag, permission: "page_marketplace" },
  { href: "/dashboard/warranty", label: "Klaim Garansi", icon: ShieldCheck, permission: "page_stock" },

  { href: "/messages", label: "Riwayat Pesan", icon: MessageSquare, permission: "page_messages" },
];

const marketingItems: { href: string; label: string; icon: React.ElementType; permission?: PermissionKey }[] = [
  { href: "/dashboard/vouchers", label: "Voucher", icon: Scissors, permission: "page_vouchers" },
  { href: "/dashboard/testimoni", label: "Kelola Testimoni", icon: Star, permission: "page_testimonials" },
  { href: "/followup", label: "Follow-Up", icon: CalendarClock, permission: "page_followup" },
  { href: "/affiliates", label: "Affiliate", icon: UserPlus, permission: "page_affiliates" },
  { href: "/sales", label: "Tim Sales", icon: Users, permission: "page_sales" },
  { href: "/retention", label: "Analisis Retensi", icon: RefreshCw, permission: "page_retention" },
  { href: "/absensi", label: "Absensi & Tugas", icon: ClipboardList, permission: "page_absensi" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useMobileNav();
  const { hasPermission, isDeveloper } = useAuth();
  const [pendingClaimsCount, setPendingClaimsCount] = useState(0);

  useEffect(() => {
    // Fetch stats to get pending claims count
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        if (data.pendingWarrantyClaims !== undefined) {
          setPendingClaimsCount(data.pendingWarrantyClaims);
        }
      } catch (err) {
        console.error("Failed to fetch pending claims count:", err);
      }
    };

    fetchStats();
    // Refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLinkClick = () => close();

  function renderNavItem(item: typeof navItems[0]) {
    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
    const allowed = !item.permission || hasPermission(item.permission);

    if (!allowed) {
      // Show locked item (greyed out, not clickable) so admin knows page exists
      return (
        <div
          key={item.href}
          className="sidebar-link opacity-30 cursor-not-allowed"
          title="Akses tidak diizinkan"
        >
          <item.icon size={18} />
          {item.label}
          <Lock size={11} className="ml-auto flex-shrink-0" />
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`sidebar-link ${isActive ? "active" : ""}`}
        onClick={handleLinkClick}
      >
        <item.icon size={18} />
        <span className="flex-1">{item.label}</span>
        {item.label === "Klaim Garansi" && pendingClaimsCount > 0 && (
          <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] flex items-center justify-center animate-pulse">
            {pendingClaimsCount}
          </span>
        )}
      </Link>
    );
  }

  return (
    <>
      {/* ── Overlay (mobile only) ── */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`sidebar fixed top-0 left-0 h-screen w-[260px] flex flex-col z-40 transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(99,102,241,0.15)]">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--gradient-primary)" }}
            >
              <ShoppingBag size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-[var(--text-primary)] tracking-tight">Dorizz Store</h1>
              <p className="text-[11px] text-[var(--text-muted)]">Management Dashboard</p>
            </div>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={close}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] px-4 mb-3">
            Menu Utama
          </p>
          {navItems.map(renderNavItem)}

          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] px-4 mb-3 mt-6">
            Marketing
          </p>
          {marketingItems.map(renderNavItem)}
        </nav>

        {/* Footer — Settings (developer only or with permission) */}
        <div className="px-4 py-4 border-t border-[rgba(99,102,241,0.15)]">
          {(isDeveloper || hasPermission("page_settings")) ? (
            <Link
              href="/settings"
              className={`sidebar-link ${pathname === "/settings" ? "active" : ""}`}
              onClick={handleLinkClick}
            >
              <Settings size={18} />
              Pengaturan
            </Link>
          ) : (
            <div className="sidebar-link opacity-30 cursor-not-allowed" title="Akses tidak diizinkan">
              <Settings size={18} />
              Pengaturan
              <Lock size={11} className="ml-auto flex-shrink-0" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
