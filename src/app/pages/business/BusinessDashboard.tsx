import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { 
  Coffee, 
  Gift, 
  Users, 
  TrendingUp, 
  ArrowUp, 
  ArrowDown,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';
import { getCurrentBusinessUser } from '@/lib/store';
import { businessAPI } from '@/lib/api';
import { toast } from 'sonner';

interface DashboardStats {
  today: {
    stamps: number;
    redeems: number;
    customers: number;
    stampsChange: number;
  };
  week: {
    stamps: number;
    redeems: number;
    customers: number;
  };
  month: {
    stamps: number;
    redeems: number;
    customers: number;
  };
}

export function BusinessDashboard() {
  const businessUser = getCurrentBusinessUser();
  const [stats, setStats] = useState<DashboardStats>({
    today: { stamps: 0, redeems: 0, customers: 0, stampsChange: 0 },
    week: { stamps: 0, redeems: 0, customers: 0 },
    month: { stamps: 0, redeems: 0, customers: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await businessAPI.getDashboard();
      
      setStats({
        today: data.today,
        week: data.week,
        month: data.month,
      });

      setRecentTransactions(
        data.recentTransactions.map((t: any) => ({
          id: t.id,
          type: t.type,
          customer: t.customer,
          time: formatTime(t.time),
        }))
      );
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Dashboard verileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dk önce`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} saat önce`;
    return date.toLocaleDateString('tr-TR');
  };

  const statCards = [
    {
      title: 'Bugünkü Damgalar',
      value: stats.today.stamps,
      icon: Coffee,
      color: 'emerald',
      change: stats.today.stampsChange,
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Bugünkü Ödüller',
      value: stats.today.redeems,
      icon: Gift,
      color: 'amber',
      change: -5.2,
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Aktif Müşteriler',
      value: stats.today.customers,
      icon: Users,
      color: 'blue',
      change: 8.7,
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Haftalık Damgalar',
      value: stats.week.stamps,
      icon: TrendingUp,
      color: 'purple',
      change: 12.4,
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {businessUser?.cafe?.name || 'İşletme'} - Genel Bakış
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 border-2 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold ${
                  stat.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {stat.change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {Math.abs(stat.change)}%
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stat.title}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <Card className="lg:col-span-2 p-6 border-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Son İşlemler
          </h2>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'stamp' 
                      ? 'bg-emerald-100 dark:bg-emerald-950' 
                      : 'bg-amber-100 dark:bg-amber-950'
                  }`}>
                    {transaction.type === 'stamp' ? (
                      <Coffee className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Gift className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {transaction.customer}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {transaction.type === 'stamp' ? 'Damga eklendi' : 'Ödül kullanıldı'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  {transaction.time}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Stats */}
        <Card className="p-6 border-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Hızlı İstatistikler
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Bu Hafta</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {stats.week.stamps} damga
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full transition-all"
                  style={{ width: '65%' }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Bu Ay</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {stats.month.stamps} damga
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: '85%' }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Toplam Müşteri</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.month.customers}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Ödül Kullanımı</span>
                <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {stats.month.redeems}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

