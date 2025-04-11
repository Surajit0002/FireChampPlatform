import { Link, useLocation } from "wouter";
import { User } from "@shared/schema";
import { Home, Trophy, Wallet, Bell, User as UserIcon } from "lucide-react";

interface MobileNavProps {
  user: User | null;
}

export function MobileNav({ user }: MobileNavProps) {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/70 backdrop-blur-md border-t border-slate-700 px-2 py-1">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex flex-col items-center p-2">
          <Home className={`h-6 w-6 ${isActive('/') ? 'text-primary' : ''}`} />
          <span className={`text-xs mt-1 ${isActive('/') ? 'text-primary' : ''}`}>Home</span>
        </Link>
        
        <Link href="/tournaments" className="flex flex-col items-center p-2">
          <Trophy className={`h-6 w-6 ${isActive('/tournaments') ? 'text-primary' : ''}`} />
          <span className={`text-xs mt-1 ${isActive('/tournaments') ? 'text-primary' : ''}`}>Matches</span>
        </Link>
        
        {user ? (
          <>
            <Link href="/wallet" className="flex flex-col items-center p-2 relative">
              <Wallet className={`h-6 w-6 ${isActive('/wallet') ? 'text-primary' : ''}`} />
              <span className={`text-xs mt-1 ${isActive('/wallet') ? 'text-primary' : ''}`}>Wallet</span>
            </Link>
            
            <Link href="/notifications" className="flex flex-col items-center p-2 relative">
              <Bell className={`h-6 w-6 ${isActive('/notifications') ? 'text-primary' : ''}`} />
              <span className="absolute -top-1 right-1 w-4 h-4 rounded-full bg-accent flex items-center justify-center text-xs font-bold">3</span>
              <span className={`text-xs mt-1 ${isActive('/notifications') ? 'text-primary' : ''}`}>Alerts</span>
            </Link>
            
            <Link href="/profile" className="flex flex-col items-center p-2">
              <div className={`relative w-6 h-6 rounded-full overflow-hidden border border-slate-700 ${isActive('/profile') ? 'border-primary' : ''}`}>
                <UserIcon className={`h-6 w-6 ${isActive('/profile') ? 'text-primary' : ''}`} />
              </div>
              <span className={`text-xs mt-1 ${isActive('/profile') ? 'text-primary' : ''}`}>Profile</span>
            </Link>
          </>
        ) : (
          <>
            <Link href="/auth" className="flex flex-col items-center p-2 relative">
              <Bell className={`h-6 w-6 ${isActive('/auth') ? 'text-primary' : ''}`} />
              <span className={`text-xs mt-1 ${isActive('/auth') ? 'text-primary' : ''}`}>Sign In</span>
            </Link>
            
            <Link href="/auth" className="flex flex-col items-center p-2">
              <UserIcon className={`h-6 w-6 ${isActive('/auth') ? 'text-primary' : ''}`} />
              <span className={`text-xs mt-1 ${isActive('/auth') ? 'text-primary' : ''}`}>Register</span>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
