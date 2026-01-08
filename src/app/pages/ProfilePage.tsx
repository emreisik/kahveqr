import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { User, Moon, MapPin, HelpCircle, FileText, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { logout, getCurrentUser } from '@/lib/store';
import { toast } from 'sonner';

export function ProfilePage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    setUser(getCurrentUser());
  }, []);

  const handleLogout = () => {
    toast.info('Çıkış yapılıyor...');
    logout();
  };

  if (!mounted) {
    return null;
  }

  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-white dark:bg-card border-b sticky top-0 z-40 backdrop-blur-lg bg-white/80 dark:bg-card/80">
        <div className="flex items-center justify-center h-16 px-4 max-w-lg mx-auto">
          <User className="w-5 h-5 text-primary mr-2" />
          <h1 className="text-lg font-bold text-foreground">Profil</h1>
        </div>
      </header>

      <main className="pt-8 px-4 max-w-lg mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="p-6 border-2">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20 border-4 border-primary/20">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white text-2xl">
                <User className="w-10 h-10" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">
                {user?.name || 'Kullanıcı'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {user?.email || user?.phone || 'kullanici@kahveqr.com'}
              </p>
            </div>
          </div>
          
          {/* Logout Button */}
          <Button
            variant="outline"
            className="w-full mt-4 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Çıkış Yap
          </Button>
        </Card>

        {/* Settings */}
        <Card className="divide-y border-2">
          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center">
                <Moon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Koyu Mod</p>
                <p className="text-xs text-muted-foreground">Tema ayarı</p>
              </div>
            </div>
            <Switch
              checked={isDark}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>

          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Konum İzni</p>
                <p className="text-xs text-muted-foreground">Demo lokasyon kullanılıyor</p>
              </div>
            </div>
            <span className="text-xs text-green-600 dark:text-green-500 font-semibold px-2.5 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
              Aktif
            </span>
          </div>
        </Card>

        {/* Links */}
        <Card className="divide-y border-2">
          <button className="w-full p-5 flex items-center justify-between hover:bg-accent transition-colors text-left group">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <HelpCircle className="w-5 h-5 text-primary" />
              </div>
              <p className="font-semibold text-foreground">Yardım & Destek</p>
            </div>
          </button>

          <button className="w-full p-5 flex items-center justify-between hover:bg-accent transition-colors text-left group">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <p className="font-semibold text-foreground">Kullanım Koşulları</p>
            </div>
          </button>
        </Card>

        <div className="text-center text-xs text-muted-foreground pt-4 pb-2 flex items-center justify-center gap-2">
          <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
            <span className="text-[10px] text-white font-bold">K</span>
          </div>
          <span>KahveQR v1.0.0</span>
        </div>
      </main>
    </div>
  );
}
