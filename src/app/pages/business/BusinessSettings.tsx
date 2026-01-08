import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { 
  Settings, 
  Store, 
  Clock, 
  Lock,
  Bell,
  Save
} from 'lucide-react';
import { getCurrentBusinessUser } from '@/lib/store';
import { businessAPI } from '@/lib/api';
import { toast } from 'sonner';

export function BusinessSettings() {
  const businessUser = getCurrentBusinessUser();
  const [loading, setLoading] = useState(false);
  const [businessInfo, setBusinessInfo] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  });
  const [workingHours, setWorkingHours] = useState({
    monday: { open: '09:00', close: '18:00', closed: false },
    tuesday: { open: '09:00', close: '18:00', closed: false },
    wednesday: { open: '09:00', close: '18:00', closed: false },
    thursday: { open: '09:00', close: '18:00', closed: false },
    friday: { open: '09:00', close: '18:00', closed: false },
    saturday: { open: '10:00', close: '17:00', closed: false },
    sunday: { open: '10:00', close: '17:00', closed: true },
  });
  const [notifications, setNotifications] = useState({
    emailOnReward: true,
    dailySummary: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await businessAPI.getSettings();
      
      setBusinessInfo({
        name: data.businessInfo.name || '',
        address: data.businessInfo.address || '',
        phone: data.businessInfo.phone || '',
        email: data.businessInfo.email || '',
      });

      if (data.workingHours) {
        setWorkingHours(data.workingHours);
      }

      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Ayarlar yüklenemedi');
    }
  };

  const handleSaveBusinessInfo = async () => {
    setLoading(true);
    try {
      await businessAPI.updateSettings({
        businessInfo: {
          name: businessInfo.name,
          address: businessInfo.address,
          phone: businessInfo.phone,
        },
      });
      toast.success('İşletme bilgileri kaydedildi');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Kaydetme başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkingHours = async () => {
    setLoading(true);
    try {
      await businessAPI.updateSettings({
        workingHours,
      });
      toast.success('Çalışma saatleri kaydedildi');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Kaydetme başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = async (key: keyof typeof notifications, value: boolean) => {
    const newNotifications = { ...notifications, [key]: value };
    setNotifications(newNotifications);
    
    try {
      await businessAPI.updateSettings({
        notifications: newNotifications,
      });
      toast.success('Bildirim tercihi kaydedildi');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Kaydetme başarısız');
      // Revert on error
      setNotifications(notifications);
    }
  };

  const days = [
    { key: 'monday', label: 'Pazartesi' },
    { key: 'tuesday', label: 'Salı' },
    { key: 'wednesday', label: 'Çarşamba' },
    { key: 'thursday', label: 'Perşembe' },
    { key: 'friday', label: 'Cuma' },
    { key: 'saturday', label: 'Cumartesi' },
    { key: 'sunday', label: 'Pazar' },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Ayarlar
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          İşletme bilgilerinizi ve tercihlerinizi yönetin
        </p>
      </div>

      <div className="space-y-6">
        {/* Business Info */}
        <Card className="p-6 border-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
              <Store className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                İşletme Bilgileri
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Temel işletme bilgileriniz
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">İşletme Adı</label>
              <Input
                value={businessInfo.name}
                onChange={(e) => setBusinessInfo({ ...businessInfo, name: e.target.value })}
                placeholder="Kafe adı"
                className="h-12"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Adres</label>
              <Textarea
                value={businessInfo.address}
                onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
                placeholder="İşletme adresi"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Telefon</label>
                <Input
                  value={businessInfo.phone}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
                  placeholder="+90 555 555 55 55"
                  className="h-12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">E-posta</label>
                <Input
                  value={businessInfo.email}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })}
                  placeholder="info@kafe.com"
                  className="h-12"
                  disabled
                />
              </div>
            </div>

            <Button
              onClick={handleSaveBusinessInfo}
              disabled={loading}
              className="w-full md:w-auto gap-2"
            >
              <Save className="w-4 h-4" />
              Bilgileri Kaydet
            </Button>
          </div>
        </Card>

        {/* Working Hours */}
        <Card className="p-6 border-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Çalışma Saatleri
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Haftalık çalışma saatleriniz
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {days.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-28">
                  <span className="font-medium text-gray-900 dark:text-white">{label}</span>
                </div>
                
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    type="time"
                    value={workingHours[key as keyof typeof workingHours].open}
                    onChange={(e) => setWorkingHours({
                      ...workingHours,
                      [key]: { ...workingHours[key as keyof typeof workingHours], open: e.target.value }
                    })}
                    disabled={workingHours[key as keyof typeof workingHours].closed}
                    className="h-10"
                  />
                  <span className="text-gray-500">-</span>
                  <Input
                    type="time"
                    value={workingHours[key as keyof typeof workingHours].close}
                    onChange={(e) => setWorkingHours({
                      ...workingHours,
                      [key]: { ...workingHours[key as keyof typeof workingHours], close: e.target.value }
                    })}
                    disabled={workingHours[key as keyof typeof workingHours].closed}
                    className="h-10"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={!workingHours[key as keyof typeof workingHours].closed}
                    onCheckedChange={(checked) => setWorkingHours({
                      ...workingHours,
                      [key]: { ...workingHours[key as keyof typeof workingHours], closed: !checked }
                    })}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {workingHours[key as keyof typeof workingHours].closed ? 'Kapalı' : 'Açık'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={handleSaveWorkingHours}
            disabled={loading}
            className="w-full md:w-auto gap-2 mt-4"
          >
            <Save className="w-4 h-4" />
            Saatleri Kaydet
          </Button>
        </Card>

        {/* Notifications */}
        <Card className="p-6 border-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
              <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Bildirimler
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Bildirim tercihlerinizi yönetin
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Ödül Bildirimleri</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Müşteri ödül kullandığında e-posta gönder
                </p>
              </div>
              <Switch
                checked={notifications.emailOnReward}
                onCheckedChange={(checked) => handleNotificationChange('emailOnReward', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Günlük Özet</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Her gün sonunda istatistik özeti al
                </p>
              </div>
              <Switch
                checked={notifications.dailySummary}
                onCheckedChange={(checked) => handleNotificationChange('dailySummary', checked)}
              />
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card className="p-6 border-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-950 flex items-center justify-center">
              <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Güvenlik
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Hesap güvenliği ayarları
              </p>
            </div>
          </div>

          <Button variant="outline" className="gap-2">
            <Lock className="w-4 h-4" />
            Şifre Değiştir
          </Button>
        </Card>
      </div>
    </div>
  );
}

