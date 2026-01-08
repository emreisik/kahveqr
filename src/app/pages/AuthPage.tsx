import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { login, register } from '@/lib/store';
import { toast } from 'sonner';

export function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        await login({
          email,
          password,
        });
        toast.success('Hoş geldiniz! 🎉');
        navigate('/wallet');
      } else {
        // Register
        await register({
          email,
          password,
        });
        toast.success('Hesabınız oluşturuldu! 🎊');
        navigate('/wallet');
      }
    } catch (error: any) {
      toast.error(isLogin ? 'Giriş başarısız' : 'Kayıt başarısız', {
        description: error.message || 'Lütfen bilgilerinizi kontrol edin',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-black dark:bg-white flex items-center justify-center mb-4">
            {/* QR Code with Stylized Coffee Bean */}
            <svg width="40" height="40" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* QR Grid Pattern */}
              <rect x="2" y="2" width="16" height="16" className="fill-white dark:fill-black" rx="3"/>
              <rect x="6" y="6" width="8" height="8" className="fill-white dark:fill-black" rx="1.5" opacity="0.3"/>
              
              <rect x="34" y="2" width="16" height="16" className="fill-white dark:fill-black" rx="3"/>
              <rect x="38" y="6" width="8" height="8" className="fill-white dark:fill-black" rx="1.5" opacity="0.3"/>
              
              <rect x="2" y="34" width="16" height="16" className="fill-white dark:fill-black" rx="3"/>
              <rect x="6" y="38" width="8" height="8" className="fill-white dark:fill-black" rx="1.5" opacity="0.3"/>
              
              {/* QR Data dots */}
              <circle cx="24" cy="6" r="2" className="fill-white dark:fill-black"/>
              <circle cx="30" cy="6" r="2" className="fill-white dark:fill-black"/>
              <circle cx="6" cy="24" r="2" className="fill-white dark:fill-black"/>
              <circle cx="6" cy="30" r="2" className="fill-white dark:fill-black"/>
              <circle cx="46" cy="24" r="2" className="fill-white dark:fill-black"/>
              <circle cx="46" cy="30" r="2" className="fill-white dark:fill-black"/>
              <circle cx="24" cy="46" r="2" className="fill-white dark:fill-black"/>
              <circle cx="30" cy="46" r="2" className="fill-white dark:fill-black"/>
              <circle cx="34" cy="34" r="2" className="fill-white dark:fill-black"/>
              <circle cx="42" cy="42" r="2" className="fill-white dark:fill-black"/>
              <circle cx="34" cy="42" r="2" className="fill-white dark:fill-black"/>
              
              {/* Beautiful Coffee Bean Center */}
              <g transform="translate(26, 26)">
                {/* Bean shadow/depth */}
                <ellipse cx="0.5" cy="0.5" rx="8.5" ry="12" className="fill-white dark:fill-black" opacity="0.3" transform="rotate(-18)"/>
                {/* Main bean */}
                <ellipse cx="0" cy="0" rx="8" ry="11.5" className="fill-white dark:fill-black" transform="rotate(-18)"/>
                {/* Bean line with curve */}
                <path d="M -1.5 -9.5 Q -0.5 -3 0 0 Q 0.5 3 1.5 9.5" 
                      className="dark:stroke-white" 
                      stroke="rgba(0,0,0,0.15)" 
                      strokeWidth="2" 
                      strokeLinecap="round"
                      fill="none"/>
                {/* Highlight */}
                <ellipse cx="-2" cy="-4" rx="2" ry="3.5" className="fill-white dark:fill-black" opacity="0.4" transform="rotate(-18 -2 -4)"/>
              </g>
            </svg>
          </div>
          <h1 className="font-bold text-black dark:text-white text-3xl tracking-tight">
            KahveQR
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base mt-2">
            {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
          </p>
        </div>

        {/* Auth Form */}
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <Input
              type="email"
              placeholder="E-posta"
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
                  {isLogin ? 'Giriş yapılıyor...' : 'Kaydediliyor...'}
                </span>
              ) : (
                <span>{isLogin ? 'Giriş Yap' : 'Hesap Oluştur'}</span>
              )}
            </Button>
          </form>

          {/* Toggle Login/Register */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
            >
              {isLogin
                ? 'Hesabınız yok mu? Kayıt olun'
                : 'Hesabınız var mı? Giriş yapın'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
