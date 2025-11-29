import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const GlassPanel = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <div className={cn("backdrop-blur-xl bg-[#0A0F14]/80 border border-white/10 shadow-2xl", className)}>
    {children}
  </div>
);

export const NeonButton = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className,
  disabled
}: { 
  children?: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  disabled?: boolean;
}) => {
  const styles = {
    primary: "bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/50 hover:bg-[#00D4FF]/20 hover:shadow-[0_0_15px_rgba(0,212,255,0.3)]",
    secondary: "bg-[#00FFB3]/10 text-[#00FFB3] border border-[#00FFB3]/50 hover:bg-[#00FFB3]/20 hover:shadow-[0_0_15px_rgba(0,255,179,0.3)]",
    danger: "bg-red-500/10 text-red-400 border border-red-500/50 hover:bg-red-500/20"
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "px-4 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
        styles[variant],
        className
      )}
    >
      {children}
    </button>
  );
};

export const Badge = ({ children, color = 'blue' }: { children?: React.ReactNode, color?: 'blue' | 'green' | 'yellow' }) => (
  <span className={cn(
    "text-xs px-2 py-0.5 rounded-full border",
    color === 'blue'
      ? "border-[#00D4FF]/30 text-[#00D4FF] bg-[#00D4FF]/5"
      : color === 'green'
        ? "border-[#00FFB3]/30 text-[#00FFB3] bg-[#00FFB3]/5"
        : "border-[#FFD166]/30 text-[#FFD166] bg-[#FFD166]/5"
  )}>
    {children}
  </span>
);
