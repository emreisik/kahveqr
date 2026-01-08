import { Link, useLocation } from 'react-router-dom';
import { Wallet, QrCode, Activity, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/wallet', icon: Wallet, label: 'Cüzdan' },
  { path: '/qr', icon: QrCode, label: 'QR' },
  { path: '/activity', icon: Activity, label: 'Aktivite' },
  { path: '/profile', icon: User, label: 'Profil' },
];

export function BottomNav() {
  const location = useLocation();

  // Landing page'de navigation'ı gizle
  if (location.pathname === '/landing') {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-card/80 backdrop-blur-lg border-t z-50 shadow-lg">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all relative',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-full" />
              )}
              <div className={cn(
                'flex flex-col items-center justify-center transition-all',
                isActive && 'scale-110'
              )}>
                <Icon className={cn("w-6 h-6", isActive && "stroke-[2.5]")} />
                <span className={cn("text-xs font-medium", isActive && "font-semibold")}>{label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}