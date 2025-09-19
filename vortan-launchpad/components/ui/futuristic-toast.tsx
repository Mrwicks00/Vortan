"use client";

import React from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FuturisticToastProps {
  title: string;
  description?: string;
  variant?: "default" | "success" | "error" | "warning" | "info";
  onClose?: () => void;
  duration?: number;
}

const variantStyles = {
  default: "border-blue-500/20 bg-blue-950/20 text-blue-100",
  success: "border-green-500/20 bg-green-950/20 text-green-100",
  error: "border-red-500/20 bg-red-950/20 text-red-100",
  warning: "border-yellow-500/20 bg-yellow-950/20 text-yellow-100",
  info: "border-blue-500/20 bg-blue-950/20 text-blue-100",
};

const variantIcons = {
  default: Info,
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

export function FuturisticToast({
  title,
  description,
  variant = "default",
  onClose,
  duration = 5000,
}: FuturisticToastProps) {
  const [isVisible, setIsVisible] = React.useState(true);
  const Icon = variantIcons[variant];

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose?.();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "glass-effect glow-border rounded-lg p-4 border-l-4 shadow-2xl backdrop-blur-sm",
        "transform transition-all duration-300 ease-out",
        "animate-in slide-in-from-right-full",
        variantStyles[variant]
      )}
      style={{
        borderLeftColor: `var(--${variant}-500)`,
        boxShadow: `0 0 20px var(--${variant}-500/20)`,
      }}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm">{title}</h4>
          {description && (
            <p className="text-xs opacity-80 mt-1">{description}</p>
          )}
        </div>

        {onClose && (
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onClose(), 300);
            }}
            className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1 bg-black/20 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-300 ease-linear"
          style={{
            width: "100%",
            background: `linear-gradient(90deg, var(--${variant}-500), var(--${variant}-400))`,
          }}
        />
      </div>
    </div>
  );
}

// Toast container
export function FuturisticToastContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {children}
    </div>
  );
}



















