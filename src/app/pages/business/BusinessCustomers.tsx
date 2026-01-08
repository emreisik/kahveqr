import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  Users, 
  Search, 
  Filter, 
  Download,
  Mail,
  Calendar,
  Award
} from 'lucide-react';
import { motion } from 'motion/react';
import { businessAPI } from '@/lib/api';
import { toast } from 'sonner';

interface Customer {
  id: string;
  name: string;
  email: string;
  currentStamps: number;
  totalStamps: number;
  totalRedeems: number;
  lastVisit: Date;
  memberSince: Date;
}

export function BusinessCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'lastVisit' | 'totalStamps'>('lastVisit');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await businessAPI.getCustomers();
      setCustomers(data.map((c: any) => ({
        ...c,
        lastVisit: new Date(c.lastVisit),
        memberSince: new Date(c.memberSince),
      })));
    } catch (error) {
      console.error('Failed to load customers:', error);
      toast.error('Müşteri listesi yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers
    .filter(customer => 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'lastVisit') return b.lastVisit.getTime() - a.lastVisit.getTime();
      if (sortBy === 'totalStamps') return b.totalStamps - a.totalStamps;
      return 0;
    });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Müşteri Yönetimi
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Toplam {customers.length} müşteri
        </p>
      </div>

      {/* Filters & Actions */}
      <Card className="p-6 border-2 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="İsim veya email ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 h-12 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
          >
            <option value="lastVisit">Son Ziyaret</option>
            <option value="name">İsim</option>
            <option value="totalStamps">Toplam Damga</option>
          </select>

          {/* Export */}
          <Button variant="outline" className="h-12 gap-2">
            <Download className="w-4 h-4" />
            Dışa Aktar
          </Button>
        </div>
      </Card>

      {/* Customers List */}
      <div className="space-y-4">
        {filteredCustomers.map((customer, index) => (
          <motion.div
            key={customer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-6 border-2 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center text-white font-bold text-xl">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {customer.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {customer.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Son: {customer.lastVisit.toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {customer.currentStamps}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Aktif Damga
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {customer.totalStamps}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Toplam Damga
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {customer.totalRedeems}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Ödül Kullanımı
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <Card className="p-12 border-2 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm ? 'Müşteri bulunamadı' : 'Henüz müşteri yok'}
          </p>
        </Card>
      )}
    </div>
  );
}

