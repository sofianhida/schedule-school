
import React from 'react';
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  return (
    <header className={cn("w-full py-6 px-8 flex items-center justify-between glass border-b border-white/10 shadow-sm animate-fade-in", className)}>
      <div className="flex items-center gap-2">
        <div className="relative">
          <div className="h-8 w-8 rounded-md bg-primary/80 animate-float shadow-md"></div>
          <div className="absolute -right-1 -bottom-1 h-4 w-4 rounded-md bg-primary/50 animate-float shadow-sm" style={{ animationDelay: '0.5s' }}></div>
        </div>
        <h1 className="text-xl font-medium ml-2">Optimalisasi Ruang Kelas</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">Penjadwalan Berbasis AI</span>
        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
          <span className="text-xs font-medium">WA</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
