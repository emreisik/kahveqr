import { Link } from 'react-router-dom';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Cafe, Membership } from '@/lib/types';
import { StampRow } from '../loyalty/StampRow';
import { ChevronRight, Gift, Trophy } from 'lucide-react';

interface WalletCafeCardProps {
  cafe: Cafe;
  membership: Membership;
}

export function WalletCafeCard({ cafe, membership }: WalletCafeCardProps) {
  const isEligible = membership.stamps >= cafe.program.stampsRequired;
  const progress = (membership.stamps / cafe.program.stampsRequired) * 100;

  return (
    <Link to={`/cafe/${cafe.id}`}>
      <Card className="overflow-hidden hover:shadow-xl transition-all cursor-pointer border-2 hover:border-primary/30 group">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-primary to-primary/80 dark:from-primary/90 dark:to-primary/70 p-5 text-white">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">{cafe.name}</h3>
              <p className="text-xs text-white/80 font-medium uppercase tracking-wide">
                {cafe.category}
              </p>
            </div>
            <ChevronRight className="w-6 h-6 text-white/80 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
          </div>

          {isEligible && (
            <div className="flex items-center gap-2 mt-3 bg-yellow-400/20 backdrop-blur-sm px-3 py-2 rounded-lg border border-yellow-400/30">
              <Trophy className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-semibold text-yellow-100">Ödülünüzü kullanabilirsiniz!</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-5 bg-white dark:bg-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                {cafe.program.rewardName}
              </span>
            </div>
            <span className="text-sm font-bold text-primary">
              {membership.stamps}/{cafe.program.stampsRequired}
            </span>
          </div>

          {/* Stamps */}
          <StampRow
            current={membership.stamps}
            total={cafe.program.stampsRequired}
          />

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground">İlerleme</span>
              <span className="text-xs font-semibold text-primary">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-green-400 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}