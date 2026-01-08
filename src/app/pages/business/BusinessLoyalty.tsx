import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { 
  Gift, 
  Save,
  Coffee,
  TrendingUp
} from 'lucide-react';
import { getCurrentBusinessUser } from '@/lib/store';
import { businessAPI } from '@/lib/api';
import { toast } from 'sonner';

export function BusinessLoyalty() {
  const businessUser = getCurrentBusinessUser();
  const [loading, setLoading] = useState(false);
  const [program, setProgram] = useState({
    stampsRequired: 10,
    rewardName: 'Ücretsiz Kahve',
    isActive: true,
    validityDays: 90,
    maxStampsPerDay: 5,
  });

  useEffect(() => {
    loadProgram();
  }, []);

  const loadProgram = async () => {
    try {
      const data = await businessAPI.getLoyaltyProgram();
      setProgram({
        stampsRequired: data.stampsRequired || 10,
        rewardName: data.rewardName || 'Ücretsiz Kahve',
        isActive: data.isActive ?? true,
        validityDays: data.validityDays || 90,
        maxStampsPerDay: data.maxStampsPerDay || 5,
      });
    } catch (error) {
      console.error('Failed to load program:', error);
      toast.error('Program yüklenemedi');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await businessAPI.updateLoyaltyProgram({
        stampsRequired: program.stampsRequired,
        rewardName: program.rewardName,
        isActive: program.isActive,
        validityDays: program.validityDays,
        maxStampsPerDay: program.maxStampsPerDay,
      });
      toast.success('Sadakat programı kaydedildi');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Kaydetme başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Sadakat Programı
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Ödül sistemini yapılandırın
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Settings */}
          <Card className="p-6 border-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center">
                <Gift className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Program Ayarları
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Temel ödül sistemi kuralları
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Stamps Required */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Gerekli Damga Sayısı
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="5"
                    max="20"
                    value={program.stampsRequired}
                    onChange={(e) => setProgram({ ...program, stampsRequired: parseInt(e.target.value) })}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <div className="w-16 h-12 flex items-center justify-center bg-amber-100 dark:bg-amber-950 rounded-lg">
                    <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
                      {program.stampsRequired}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Bir ödül için {program.stampsRequired} damga gerekli
                </p>
              </div>

              {/* Reward Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Ödül İsmi
                </label>
                <Input
                  value={program.rewardName}
                  onChange={(e) => setProgram({ ...program, rewardName: e.target.value })}
                  placeholder="Ödül açıklaması"
                  className="h-12"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Müşteriler bu ödülü kazanacak
                </p>
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Program Aktif</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sadakat programını aç/kapat
                  </p>
                </div>
                <Switch
                  checked={program.isActive}
                  onCheckedChange={(checked) => setProgram({ ...program, isActive: checked })}
                />
              </div>
            </div>
          </Card>

          {/* Advanced Settings */}
          <Card className="p-6 border-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Gelişmiş Ayarlar
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Damga Geçerlilik Süresi (Gün)
                </label>
                <Input
                  type="number"
                  value={program.validityDays}
                  onChange={(e) => setProgram({ ...program, validityDays: parseInt(e.target.value) })}
                  className="h-12"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Damgalar {program.validityDays} gün sonra geçersiz olur
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Günlük Maksimum Damga
                </label>
                <Input
                  type="number"
                  value={program.maxStampsPerDay}
                  onChange={(e) => setProgram({ ...program, maxStampsPerDay: parseInt(e.target.value) })}
                  className="h-12"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Bir müşteri günde en fazla {program.maxStampsPerDay} damga alabilir
                </p>
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={loading}
            className="w-full h-12 gap-2"
          >
            <Save className="w-5 h-5" />
            Değişiklikleri Kaydet
          </Button>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          {/* Program Preview */}
          <Card className="p-6 border-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Önizleme
            </h3>

            <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm opacity-90">Ödül Programı</p>
                  <p className="text-2xl font-bold">{businessUser?.cafe?.name}</p>
                </div>
                <Coffee className="w-10 h-10 opacity-90" />
              </div>

              <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">İlerleme</span>
                  <span className="text-sm font-semibold">7/{program.stampsRequired}</span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all"
                    style={{ width: `${(7 / program.stampsRequired) * 100}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/30">
                <p className="text-sm opacity-90 mb-1">Ödül</p>
                <p className="font-semibold">{program.rewardName}</p>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${
              program.isActive 
                ? 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}>
              <p className="text-sm font-semibold text-center">
                {program.isActive ? '✓ Program Aktif' : '✕ Program Pasif'}
              </p>
            </div>
          </Card>

          {/* Stats */}
          <Card className="p-6 border-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Program İstatistikleri
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Toplam Üye</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">512</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Verilen Damga</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">2,890</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Kullanılan Ödül</span>
                <span className="text-lg font-bold text-amber-600 dark:text-amber-400">245</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <span className="text-sm text-blue-600 dark:text-blue-400">Dönüşüm Oranı</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">8.5%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

