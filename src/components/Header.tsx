import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, User, Globe, Wallet, LogOut, ArrowDownLeft, ArrowUpRight, History } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";

export function Header() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { wallet } = useWallet();
  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <Globe className="h-4 w-4" />
            <span className="hidden lg:inline">Global</span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 bg-success/10 text-success px-2 sm:px-3 py-1 rounded-lg cursor-pointer hover:bg-success/20 transition-colors">
                <Wallet className="h-4 w-4" />
                <span className="font-medium text-sm sm:text-base">
                  ${wallet?.balance?.toFixed(2) || '0.00'}
                </span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border border-border">
              <DropdownMenuItem onClick={() => navigate('/deposit')} className="cursor-pointer">
                <ArrowDownLeft className="mr-2 h-4 w-4" />
                Deposit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/withdraw')} className="cursor-pointer">
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Withdraw
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/transaction-history')} className="cursor-pointer">
                <History className="mr-2 h-4 w-4" />
                Transaction History
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>


          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" aria-label="Open profile menu">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border border-border">
              <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}