"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { logout } from "@/actions/auth";

interface LogoutButtonProps {
  collapsed?: boolean;
  className?: string;
  variant?: "sidebar" | "bottom-nav" | "navbar";
}

export default function LogoutButton({ collapsed, className, variant = "sidebar" }: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (confirm("Apakah Anda yakin ingin keluar?")) {
      setLoading(true);
      await logout();
    }
  }

  if (variant === "bottom-nav") {
    return (
      <button
        onClick={handleLogout}
        className="flex flex-col items-center p-2.5 rounded-xl min-w-0 flex-1 opacity-70 hover:opacity-100 transition-all"
        disabled={loading}
      >
        <LogOut size={20} className={loading ? "animate-pulse" : ""} style={{ color: "rgba(255,255,255,0.45)" }} />
        <span className="text-[10px] mt-0.5 font-bold tracking-wide text-white/30">
          {loading ? "..." : "Keluar"}
        </span>
      </button>
    );
  }

  if (variant === "navbar") {
    return (
      <button
        onClick={handleLogout}
        className="flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all text-white/50 hover:text-white hover:bg-white/10"
        disabled={loading}
      >
        <LogOut size={20} className={loading ? "animate-pulse" : ""} />
        <span className="text-[10px] font-bold">
          {loading ? "..." : "Keluar"}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all w-full group ${className || ""}`}
      style={{ color: "rgba(255,255,255,0.5)" }}
      onMouseEnter={(e) => {
        if (!loading) {
          (e.currentTarget as HTMLElement).style.background = "rgba(220,38,38,0.15)";
          (e.currentTarget as HTMLElement).style.color = "#f47272";
        }
      }}
      onMouseLeave={(e) => {
        if (!loading) {
          (e.currentTarget as HTMLElement).style.background = "";
          (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)";
        }
      }}
    >
      <LogOut size={20} className={`flex-shrink-0 ${loading ? "animate-spin" : ""}`} />
      {!collapsed && (
        <span className="font-semibold text-sm whitespace-nowrap">
          {loading ? "Keluar..." : "Keluar"}
        </span>
      )}
    </button>
  );
}
