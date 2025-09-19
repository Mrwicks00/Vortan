"use client";

import type React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

interface MainLayoutProps {
  children: React.ReactNode;
}

function getPageBackgroundClass(pathname: string): string {
  if (pathname === "/") return "bg-home";
  if (pathname.startsWith("/projects")) return "bg-projects";
  if (pathname.startsWith("/staking")) return "bg-staking";
  if (pathname.startsWith("/analytics")) return "bg-analytics";
  if (pathname.startsWith("/admin")) return "bg-admin";
  if (pathname.startsWith("/governance")) return "bg-governance";
  return "";
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const backgroundClass = getPageBackgroundClass(pathname);

  return (
    <div className={cn("min-h-screen bg-background", backgroundClass)}>
      <Sidebar />
      <Topbar />
      <main className="pt-16 lg:ml-64 transition-all duration-300">
        <div className="p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}
