import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { getState, getCurrentUser } from '@/lib/store';
import { QrCode, Coffee, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

export function QrPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [qrData, setQrData] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = getCurrentUser();
        setUser(currentUser);
        
        // Generate QR data with current timestamp
        if (currentUser) {
          const data = JSON.stringify({
            type: 'user',
            userId: currentUser.id,
            email: currentUser.email,
            timestamp: Date.now(),
          });
          setQrData(data);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    
    // Refresh QR data every 2 minutes to keep timestamp fresh
    const interval = setInterval(() => {
      const currentUser = getCurrentUser();
      if (currentUser) {
        const data = JSON.stringify({
          type: 'user',
          userId: currentUser.id,
          email: currentUser.email,
          timestamp: Date.now(),
        });
        setQrData(data);
      }
    }, 2 * 60 * 1000); // 2 minutes

    return () => clearInterval(interval);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(qrData);
    setCopied(true);
    toast.success('QR verisi kopyalandı!', {
      description: 'Scanner sayfasına yapıştırabilirsiniz',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || !user || !qrData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Coffee className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-white dark:bg-card border-b sticky top-0 z-40 backdrop-blur-lg bg-white/80 dark:bg-card/80">
        <div className="flex items-center justify-center h-16 px-4 max-w-lg mx-auto">
          <QrCode className="w-5 h-5 text-primary mr-2" />
          <h1 className="text-lg font-bold text-foreground">QR Kodum</h1>
        </div>
      </header>

      <main className="pt-8 px-4 max-w-lg mx-auto space-y-6">
        {/* Universal QR Code */}
        <Card className="p-8 border-2">
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-foreground mb-1">
              Kullanıcı QR Kodunuz
            </h2>
            <p className="text-sm text-muted-foreground">
              Damga kazanmak için kasada okutun
            </p>
          </div>

          {/* QR Code */}
          <div className="bg-white rounded-2xl p-8 max-w-[320px] mx-auto border-4 border-emerald-100 dark:border-emerald-900">
            <QRCodeSVG
              value={qrData}
              size={256}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%2310b981'/%3E%3Ctext x='50' y='70' font-size='60' fill='white' text-anchor='middle' font-weight='bold'%3EK%3C/text%3E%3C/svg%3E",
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
          </div>

          {/* User Info */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Kullanıcı:</span>
              <span className="font-mono font-semibold text-foreground">
                {user.email}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs mt-2">
              <span className="text-muted-foreground">ID:</span>
              <span className="font-mono text-xs text-muted-foreground">
                {user.id.slice(0, 8)}...
              </span>
            </div>
          </div>

          {/* Copy Button */}
          <Button
            onClick={handleCopy}
            className="w-full mt-4 h-12 bg-emerald-600 hover:bg-emerald-700"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Kopyalandı!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                QR Verisini Kopyala
              </>
            )}
          </Button>

          {/* QR Data (Expandable) */}
          <details className="mt-4">
            <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
              QR verisini göster
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">
              {JSON.stringify(JSON.parse(qrData), null, 2)}
            </pre>
          </details>
        </Card>

        {/* Instructions */}
        <Card className="p-6 border-2 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800">
          <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-3 flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Nasıl Kullanılır?
          </h3>
          <ul className="space-y-2 text-sm text-emerald-800 dark:text-emerald-200">
            <li className="flex gap-2">
              <span className="font-bold">1.</span>
              <span>Kafeye gidin ve sipariş verin</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">2.</span>
              <span>Ödeme sonrası bu QR kodu kasada gösterin</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">3.</span>
              <span>Kafe personeli taradığında damga kazanırsınız</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">4.</span>
              <span>Kartınız dolduğunda ücretsiz ödülünüzü alın!</span>
            </li>
          </ul>
        </Card>
      </main>
    </div>
  );
}