"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Home,
  Rocket,
  Coins,
  BarChart3,
  Settings,
  Vote,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Projects", href: "/projects", icon: Rocket },
  { name: "Staking", href: "/staking", icon: Coins },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Admin", href: "/admin", icon: Settings },
  { name: "Governance", href: "/governance", icon: Vote },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-40 h-screen transition-all duration-300 glass-effect glow-border",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 relative">
                <Image
                  src="/Vortan.png"
                  alt="Vortan Logo"
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              </div>
              <span className="font-heading text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                VORTAN
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="hover:bg-primary/20"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start transition-all duration-200",
                    collapsed ? "px-2" : "px-4",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg animate-glow"
                      : "hover:bg-primary/20 hover:text-primary"
                  )}
                >
                  <item.icon
                    className={cn("h-5 w-5", collapsed ? "" : "mr-3")}
                  />
                  {!collapsed && <span>{item.name}</span>}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div
            className={cn(
              "text-xs text-muted-foreground",
              collapsed ? "text-center" : ""
            )}
          >
            {collapsed ? "V1.0" : "Vortan v1.0.0"}
          </div>
        </div>
      </div>
    </div>
  );
}
