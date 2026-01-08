import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Store, ArrowLeft } from 'lucide-react';
import { businessLogin } from '@/lib/store';
import { toast } from 'sonner';

export function BusinessLoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await businessLogin({ email, password });
      
      toast.success('Hoş geldiniz!');
      navigate('/business/dashboard');
    } catch (error: any) {
      toast.error('Giriş başarısız', {
        description: error.message || 'Lütfen bilgilerinizi kontrol edin',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Ana Sayfa
        </button>

        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-black dark:bg-white flex items-center justify-center mb-4">
            <Store className="w-9 h-9 text-white dark:text-black" />
          </div>
          <h1 className="font-bold text-black dark:text-white text-3xl tracking-tight">
            İşletme Girişi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base mt-2">
            Personel Paneli
          </p>
        </div>

        {/* Auth Form */}
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <Input
              type="email"
              placeholder="İşletme E-postası"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl"
              required
            />

            {/* Password */}
            <Input
              type="password"
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl"
              required
              minLength={6}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full h-12 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black font-semibold rounded-xl"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
                  Giriş yapılıyor...
                </span>
              ) : (
                <span>Giriş Yap</span>
              )}
            </Button>
          </form>
        </div>

        {/* Info */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-800 dark:text-blue-200 text-center">
            💼 Sadece işletme hesapları giriş yapabilir
          </p>
        </div>
      </div>
    </div>
  );
}

