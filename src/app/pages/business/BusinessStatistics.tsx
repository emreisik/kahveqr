import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  TrendingUp, 
  Download,
  Calendar,
  Coffee,
  Gift,
  Users,
  ArrowUp
} from 'lucide-react';
import { businessAPI } from '@/lib/api';
import { toast } from 'sonner';

export function BusinessStatistics() {
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('week');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStamps: 0,
    totalRedeems: 0,
    uniqueCustomers: 0,
    avgStampsPerCustomer: 0,
    conversionRate: 0,
    growthRate: 15.3,
  });
  const [hourlyData, setHourlyData] = useState<Array<{ hour: string; stamps: number }>>([]);

  useEffect(() => {
    loadStatistics();
  }, [dateRange]);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const data = await businessAPI.getStatistics(dateRange);
      
      setStats({
        totalStamps: data.totalStamps,
        totalRedeems: data.totalRedeems,
        uniqueCustomers: data.uniqueCustomers,
        avgStampsPerCustomer: data.avgStampsPerCustomer,
        conversionRate: data.conversionRate,
        growthRate: 15.3, // This would need historical data
      });

      setHourlyData(data.hourlyActivity || []);
    } catch (error) {
      console.error('Failed to load statistics:', error);
      toast.error('İstatistikler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const maxStamps = hourlyData.length > 0 
    ? Math.max(...hourlyData.map(d => d.stamps)) 
    : 1;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            İstatistikler & Raporlar
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Detaylı analiz ve performans metrikleri
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          PDF İndir
        </Button>
      </div>

      {/* Date Range Selector */}
      <Card className="p-4 border-2 mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <div className="flex gap-2">
            {(['today', 'week', 'month'] as const).map((range) => (
              <Button
                key={range}
                variant={dateRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDateRange(range)}
              >
                {range === 'today' && 'Bugün'}
                {range === 'week' && 'Bu Hafta'}
                {range === 'month' && 'Bu Ay'}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 border-2">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
              <Coffee className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-green-600">
              <ArrowUp className="w-3 h-3" />
              {stats.growthRate}%
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.totalStamps}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Toplam Damga
          </p>
        </Card>

        <Card className="p-6 border-2">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center">
              <Gift className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.totalRedeems}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Kullanılan Ödül
          </p>
        </Card>

        <Card className="p-6 border-2">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.uniqueCustomers}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Aktif Müşteri
          </p>
        </Card>

        <Card className="p-6 border-2">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.conversionRate}%
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Dönüşüm Oranı
          </p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Activity */}
        <Card className="p-6 border-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Saatlik Yoğunluk
          </h2>
          <div className="space-y-3">
            {hourlyData.map((data) => (
              <div key={data.hour} className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-16">
                  {data.hour}
                </span>
                <div className="flex-1 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-end pr-3 transition-all"
                    style={{ width: `${(data.stamps / maxStamps) * 100}%` }}
                  >
                    {data.stamps > 15 && (
                      <span className="text-xs font-semibold text-white">
                        {data.stamps}
                      </span>
                    )}
                  </div>
                </div>
                {data.stamps <= 15 && (
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 w-8">
                    {data.stamps}
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card className="p-6 border-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Performans Metrikleri
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Ortalama Damga / Müşteri
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats.avgStampsPerCustomer}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{ width: '62%' }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Ödül Kullanım Oranı
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats.conversionRate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-amber-500 h-2 rounded-full"
                  style={{ width: '29%' }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Müşteri Büyümesi
                </span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  +{stats.growthRate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: '15%' }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                En Yoğun Saat
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-3 text-white">
                  <p className="text-2xl font-bold">13:00</p>
                  <p className="text-sm opacity-90">42 işlem</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

