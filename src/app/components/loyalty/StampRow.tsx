import { Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StampRowProps {
  current: number;
  total: number;
}

export function StampRow({ current, total }: StampRowProps) {
  const stamps = Array.from({ length: total }, (_, i) => i < current);

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {stamps.map((filled, index) => (
        <div
          key={index}
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center transition-all',
            filled
              ? 'bg-amber-600 text-white scale-100'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600'
          )}
        >
          <Coffee className="w-4 h-4" strokeWidth={filled ? 2.5 : 2} />
        </div>
      ))}
    </div>
  );
}
