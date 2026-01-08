import { useNavigate } from 'react-router-dom';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Cafe } from '@/lib/types';
import { formatDistance } from '@/lib/utils';
import { MapPin, Clock, Gift, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { joinCafe } from '@/lib/store';

interface NearbyCafeCardProps {
  cafe: Cafe;
  isMember: boolean;
}

export function NearbyCafeCard({ cafe, isMember }: NearbyCafeCardProps) {
  const navigate = useNavigate();

  const handleJoin = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isMember) {
      joinCafe(cafe.id);
    }
  };

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20"
      onClick={() => navigate(`/cafe/${cafe.id}`)}
    >
      {/* Header with gradient */}
      <div className="bg-gradient-to-br from-primary to-primary/80 dark:from-primary/90 dark:to-primary/70 p-5 text-white">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{cafe.name}</h3>
            <p className="text-xs text-white/80 font-medium uppercase tracking-wide">
              {cafe.category}
            </p>
          </div>
          <div
            className={cn(
              'px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1',
              cafe.openNow
                ? 'bg-green-400 text-green-900'
                : 'bg-white/20 text-white'
            )}
          >
            <Clock className="w-3 h-3" />
            {cafe.openNow ? 'Açık' : 'Kapalı'}
          </div>
        </div>

        {/* Distance */}
        <div className="flex items-center gap-1.5 text-white/90">
          <MapPin className="w-4 h-4" />
          <span className="text-sm font-medium">{formatDistance(cafe.distanceKm)}</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 bg-white dark:bg-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-start gap-2">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
              <Gift className="w-5 h-5 text-amber-600 dark:text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Ödül</p>
              <p className="font-semibold text-sm text-foreground">
                {cafe.program.rewardName}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-0.5">Damga</p>
            <p className="font-bold text-lg text-primary">
              {cafe.program.stampsRequired}
            </p>
          </div>
        </div>

        {/* Action Button */}
        {isMember ? (
          <Button
            variant="outline"
            className="w-full group"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/cafe/${cafe.id}`);
            }}
          >
            <span>Detayları Gör</span>
            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        ) : (
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-white"
            onClick={handleJoin}
          >
            Katıl ve Damga Toplamaya Başla
          </Button>
        )}
      </div>
    </Card>
  );
}
