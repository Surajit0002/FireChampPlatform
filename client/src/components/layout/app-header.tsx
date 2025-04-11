import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WalletModal } from "@/components/ui/wallet-modal";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Bell, LogOut, Settings, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { WalletData } from "@/types";

export function AppHeader() {
  const { user, logoutMutation } = useAuth();
  
  const { data: walletData } = useQuery<WalletData>({
    queryKey: ["/api/wallet"],
    enabled: !!user,
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/70 backdrop-blur-md border-b border-slate-700">
      <div className="container mx-auto py-3 px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="absolute text-white font-bold text-lg">FC</span>
          </div>
          <span className="font-heading font-bold text-xl tracking-tight">FireChamp</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="font-medium hover:text-primary-light transition-colors">Home</Link>
          <Link href="/tournaments" className="font-medium hover:text-primary-light transition-colors">Tournaments</Link>
          <Link href="/leaderboard" className="font-medium hover:text-primary-light transition-colors">Leaderboard</Link>
          <Link href="/refer" className="font-medium hover:text-primary-light transition-colors">Refer & Earn</Link>
        </nav>
        
        {/* User Controls */}
        <div className="flex items-center space-x-3">
          {user ? (
            <>
              {/* Balance */}
              {walletData && (
                <div className="hidden md:block">
                  <WalletModal walletData={walletData} />
                </div>
              )}
              
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent flex items-center justify-center text-xs font-bold">3</span>
              </Button>
              
              {/* User */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9 border-2 border-primary">
                      <AvatarImage src={user.avatar || ''} alt={user.username} />
                      <AvatarFallback className="bg-primary-dark">
                        {user.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-dark border-slate-700">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/wallet" className="cursor-pointer flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Wallet</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="cursor-pointer text-red-500 focus:text-red-500"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild className="bg-primary hover:bg-primary-light">
              <Link href="/auth">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNav user={user} />
    </header>
  );
}
