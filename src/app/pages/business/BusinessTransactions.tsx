import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  FileText, 
  Search, 
  Download,
  Coffee,
  Gift,
  Clock,
  Calendar,
  Filter
} from 'lucide-react';
import { motion } from 'motion/react';
import { businessAPI } from '@/lib/api';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  type: 'stamp' | 'redeem';
  customerName: string;
  customerEmail: string;
  timestamp: Date;
  staffName: string;
}

export function BusinessTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'stamp' | 'redeem'>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');

  useEffect(() => {
    loadTransactions();
  }, [filterType, dateRange, searchTerm]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await businessAPI.getTransactions({
        type: filterType,
        dateRange,
        search: searchTerm,
      });
      
      setTransactions(data.map((t: any) => ({
        ...t,
        timestamp: new Date(t.timestamp),
      })));
    } catch (error) {
      console.error('Failed to load transactions:', error);
      toast.error('İşlem geçmişi yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: transactions.length,
    stamps: transactions.filter(t => t.type === 'stamp').length,
    redeems: transactions.filter(t => t.type === 'redeem').length,
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          İşlem Geçmişi
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Toplam {stats.total} işlem ({stats.stamps} damga, {stats.redeems} ödül)
        </p>
      </div>

      {/* Filters */}
      <Card className="p-6 border-2 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Müşteri ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 h-12 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
          >
            <option value="all">Tüm İşlemler</option>
            <option value="stamp">Damgalar</option>
            <option value="redeem">Ödüller</option>
          </select>

          {/* Date Range */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-4 h-12 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
          >
            <option value="all">Tüm Zamanlar</option>
            <option value="today">Bugün</option>
            <option value="week">Son 7 Gün</option>
            <option value="month">Son 30 Gün</option>
          </select>

          {/* Export */}
          <Button variant="outline" className="h-12 gap-2">
            <Download className="w-4 h-4" />
            Excel
          </Button>
        </div>
      </Card>

      {/* Transactions List */}
      <div className="space-y-3">
        {transactions.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <Card className="p-5 border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    transaction.type === 'stamp'
                      ? 'bg-emerald-100 dark:bg-emerald-950'
                      : 'bg-amber-100 dark:bg-amber-950'
                  }`}>
                    {transaction.type === 'stamp' ? (
                      <Coffee className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Gift className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    )}
                  </div>

                  {/* Info */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {transaction.customerName}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <span>{transaction.customerEmail}</span>
                      <span>•</span>
                      <span className={
                        transaction.type === 'stamp'
                          ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                          : 'text-amber-600 dark:text-amber-400 font-medium'
                      }>
                        {transaction.type === 'stamp' ? 'Damga Eklendi' : 'Ödül Kullanıldı'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="text-right">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <Calendar className="w-4 h-4" />
                    {transaction.timestamp.toLocaleDateString('tr-TR')}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                    <Clock className="w-3 h-3" />
                    {transaction.timestamp.toLocaleTimeString('tr-TR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {transactions.length === 0 && !loading && (
        <Card className="p-12 border-2 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm || filterType !== 'all' ? 'İşlem bulunamadı' : 'Henüz işlem yok'}
          </p>
        </Card>
      )}
    </div>
  );
}

