import { Activity, Cafe } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils';
import { Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityListProps {
  activities: Activity[];
  cafes: Cafe[];
  filter?: 'all' | 'earn' | 'redeem';
}

export function ActivityList({ activities, cafes, filter = 'all' }: ActivityListProps) {
  const filtered = activities.filter((a) => {
    if (filter === 'all') return true;
    return a.type === filter;
  });

  const getCafeName = (cafeId: string) => {
    return cafes.find((c) => c.id === cafeId)?.name || 'Bilinmeyen Kafe';
  };

  if (filtered.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-sm text-muted-foreground">Henüz aktivite yok</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {filtered.map((activity) => {
        const isEarn = activity.type === 'earn';
        return (
          <div key={activity.id} className="flex items-center gap-3 py-3.5 px-4">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                isEarn
                  ? 'bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
              )}
            >
              {isEarn ? (
                <Plus className="w-4 h-4 stroke-[2]" />
              ) : (
                <Minus className="w-4 h-4 stroke-[2]" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {getCafeName(activity.cafeId)}
              </p>
              <p className="text-xs text-muted-foreground">
                {isEarn
                  ? `+${activity.delta} damga`
                  : `${Math.abs(activity.delta)} damga kullanıldı`}
              </p>
            </div>
            
            <div className="text-xs text-muted-foreground">
              {formatRelativeTime(activity.createdAt)}
            </div>
          </div>
        );
      })}
    </div>
  );
}