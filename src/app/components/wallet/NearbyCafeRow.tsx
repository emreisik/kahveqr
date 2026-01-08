import { useNavigate } from 'react-router-dom';
import { Button } from '@/app/components/ui/button';
import { Cafe } from '@/lib/types';
import { formatDistance } from '@/lib/utils';
import { MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NearbyCafeRowProps {
  cafe: Cafe;
  isMember: boolean;
}

export function NearbyCafeRow({ cafe, isMember }: NearbyCafeRowProps) {
  const navigate = useNavigate();

  return (
    <div
      className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors"
      onClick={() => navigate(`/cafe/${cafe.id}`)}
    >
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 dark:text-gray-100">{cafe.name}</h3>
        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            <MapPin className="w-3 h-3" />
            <span>{formatDistance(cafe.distanceKm)}</span>
          </div>
          <div
            className={cn(
              'flex items-center gap-1 text-xs',
              cafe.openNow
                ? 'text-green-600 dark:text-green-500'
                : 'text-gray-500 dark:text-gray-400'
            )}
          >
            <Clock className="w-3 h-3" />
            <span>{cafe.openNow ? 'Açık' : 'Kapalı'}</span>
          </div>
        </div>
      </div>
      {isMember ? (
        <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
          Detay
        </Button>
      ) : (
        <Button
          variant="default"
          size="sm"
          className="bg-amber-600 hover:bg-amber-700"
          onClick={(e) => e.stopPropagation()}
        >
          Katıl
        </Button>
      )}
    </div>
  );
}
