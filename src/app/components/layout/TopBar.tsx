import { MapPin, Coffee } from 'lucide-react';

interface TopBarProps {
  location?: string;
  showLocation?: boolean;
}

export function TopBar({ location = 'Kadıköy', showLocation = true }: TopBarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-card/80 backdrop-blur-lg border-b z-40">
      <div className="flex items-center justify-between h-16 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Coffee className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-foreground">KahveQR</h1>
        </div>
        {showLocation && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-full">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">{location}</span>
          </div>
        )}
      </div>
    </header>
  );
}