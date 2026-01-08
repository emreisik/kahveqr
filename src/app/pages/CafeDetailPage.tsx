import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { getState, redeemReward, getCafes, getCurrentUser } from '@/lib/store';
import { ArrowLeft, Coffee, Plus, Minus, Copy, Check, MapPin, Phone, Clock, ChevronDown, Info } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { formatRelativeTime } from '@/lib/utils';
import { Cafe } from '@/lib/types';
import { QRCodeSVG } from 'qrcode.react';

export function CafeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<any>(null);
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [stateData, cafesData] = await Promise.all([
          getState(),
          getCafes(),
        ]);
        setState(stateData);
        const foundCafe = cafesData.find((c) => c.id === id);
        setCafe(foundCafe || null);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black flex items-center justify-center">
        <Coffee className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  if (!cafe || !state) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Kafe bulunamadı</p>
      </div>
    );
  }

  const membership = state.memberships.find((m) => m.cafeId === cafe.id);
  const isMember = !!membership;
  const isCompleted = membership && membership.stamps >= cafe.program.stampsRequired;
  const progress = membership ? (membership.stamps / cafe.program.stampsRequired) * 100 : 0;

  // Filter activities for this cafe
  const cafeActivities = state.activities.filter((a) => a.cafeId === cafe.id);

  const handleQrScan = async () => {
    if (!isCompleted) return;
    try {
      await redeemReward(cafe.id, cafe.program.stampsRequired);
      const newState = await getState();
      setState(newState);
      toast.success('✓ Afiyet olsun!', {
        description: `${cafe.program.rewardName} ödülünüz kullanıldı`,
      });
    } catch (error) {
      toast.error('Hata', {
        description: 'Ödül kullanılamadı',
      });
    }
  };

  const handleCopyRedemptionQr = () => {
    navigator.clipboard.writeText(redemptionQrData);
    setCopied(true);
    toast.success('Ödül QR verisi kopyalandı!', {
      description: 'Kasada taranmak için hazır',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const getCardStyle = (cafeId: string) => {
    const styles: Record<string, { gradient: string }> = {
      'cafe-1': { gradient: 'from-emerald-600 via-emerald-700 to-teal-800' },
      'cafe-2': { gradient: 'from-amber-700 via-orange-700 to-red-800' },
      'cafe-3': { gradient: 'from-slate-700 via-slate-800 to-zinc-900' },
      'cafe-4': { gradient: 'from-rose-700 via-pink-700 to-purple-800' },
      'cafe-5': { gradient: 'from-blue-700 via-indigo-700 to-violet-800' },
      'cafe-6': { gradient: 'from-yellow-600 via-amber-600 to-orange-700' },
      'cafe-7': { gradient: 'from-cyan-700 via-teal-700 to-sky-800' },
      'cafe-8': { gradient: 'from-lime-700 via-green-700 to-emerald-800' },
      'cafe-9': { gradient: 'from-red-800 via-orange-800 to-amber-900' },
      'cafe-10': { gradient: 'from-purple-700 via-fuchsia-700 to-pink-800' },
      'cafe-11': { gradient: 'from-gray-700 via-gray-800 to-slate-900' },
    };
    return styles[cafeId] || styles['cafe-1'];
  };

  const style = getCardStyle(cafe.id);
  const user = getCurrentUser();

  // QR Code for redemption
  const redemptionQrData = JSON.stringify({
    type: 'redeem',
    userId: user?.id,
    cafeId: cafe.id,
    timestamp: Date.now(),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black pb-20">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="flex items-center gap-3 h-16 px-4 max-w-lg mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-gray-100" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Kart Detayı</h1>
        </div>
      </header>

      <main className="pt-8 px-6 max-w-lg mx-auto space-y-6">
        {/* Credit Card Preview */}
        <div className={`
          relative w-full aspect-[1.586/1] rounded-2xl 
          bg-gradient-to-br ${style.gradient}
          shadow-2xl overflow-hidden
        `}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-32 translate-x-32" />
          
          <div className="relative h-full flex flex-col justify-between p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  {cafe.name}
                </h3>
                <p className="text-sm text-white opacity-80 mt-1">
                  {cafe.category || 'Kahve'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Coffee className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="my-4">
              <div className={`grid gap-1.5 ${cafe.program.stampsRequired === 8 ? 'grid-cols-8' : 'grid-cols-10'}`}>
                {Array.from({ length: cafe.program.stampsRequired }).map((_, idx) => {
                  const isFilled = membership && idx < membership.stamps;
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-center"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        className={`transition-all duration-500 ${isFilled ? 'opacity-100 scale-100' : 'opacity-30 scale-90'}`}
                      >
                        <path
                          d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill={isFilled ? 'white' : 'none'}
                        />
                        {isFilled && (
                          <>
                            <path d="M7 3 L7 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
                            <path d="M10 2 L10 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
                            <path d="M13 3 L13 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
                          </>
                        )}
                      </svg>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-white opacity-70 mb-1 font-medium">İlerleme</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">
                    {membership?.stamps || 0}
                  </span>
                  <span className="text-lg text-white opacity-60">
                    / {cafe.program.stampsRequired}
                  </span>
                </div>
              </div>
              
              {isCompleted && (
                <div className="px-4 py-2 bg-white/30 backdrop-blur-md rounded-full animate-pulse">
                  <span className="text-sm font-bold text-white">✓ Hazır</span>
                </div>
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div
                className="h-full bg-white/60 transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Business Information - Collapsible */}
        <details className="group">
          <summary className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
                <Info className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                İşletme Bilgileri
              </span>
            </div>
            <ChevronDown className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180" />
          </summary>
          
          <Card className="mt-2 p-4 border-2">
            <div className="space-y-3">
              {/* Address */}
              {cafe.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Adres
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {cafe.address}
                    </p>
                  </div>
                </div>
              )}

              {/* Phone */}
              {cafe.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Telefon
                    </p>
                    <a 
                      href={`tel:${cafe.phone}`}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {cafe.phone}
                    </a>
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Durum
                  </p>
                  <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${
                    cafe.openNow 
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cafe.openNow ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    {cafe.openNow ? 'Açık' : 'Kapalı'}
                  </div>
                </div>
              </div>

              {/* Reward Info */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🎁</span>
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                      Ödül Programı
                    </p>
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    {cafe.program.stampsRequired} damga topla, <strong>{cafe.program.rewardName}</strong> kazan
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </details>

        {/* QR Code or Status Message */}
        {isCompleted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="p-8 border-2 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800">
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-full mb-2">
                  <span className="text-lg">🎁</span>
                  <span className="font-bold">Ödülünüz Hazır!</span>
                </div>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  {cafe.program.rewardName}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 max-w-[280px] mx-auto border-4 border-emerald-200 dark:border-emerald-800">
                <QRCodeSVG
                  value={redemptionQrData}
                  size={256}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23f59e0b'/%3E%3Ctext x='50' y='70' font-size='60' fill='white' text-anchor='middle' font-weight='bold'%3E★%3C/text%3E%3C/svg%3E",
                    height: 40,
                    width: 40,
                    excavate: true,
                  }}
                />
              </div>

              <p className="text-center text-xs text-emerald-700 dark:text-emerald-300 mt-4 font-medium">
                Kasada bu QR kodu okutarak ödülünüzü alın
              </p>

              {/* Copy Button */}
              <Button
                onClick={handleCopyRedemptionQr}
                className="w-full mt-4 h-12 bg-amber-600 hover:bg-amber-700 text-white"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Kopyalandı!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Ödül QR Verisini Kopyala
                  </>
                )}
              </Button>

              {/* QR Data (Expandable) */}
              <details className="mt-4">
                <summary className="cursor-pointer text-xs text-emerald-700 dark:text-emerald-300 text-center hover:underline">
                  QR verisini göster
                </summary>
                <pre className="mt-2 p-3 bg-white dark:bg-emerald-900/20 rounded text-xs overflow-x-auto border border-emerald-200 dark:border-emerald-800">
                  {JSON.stringify(JSON.parse(redemptionQrData), null, 2)}
                </pre>
              </details>
            </Card>
          </motion.div>
        ) : (
          <div className="p-8 bg-gray-50 dark:bg-gray-900 rounded-lg text-center border-2 border-dashed border-gray-200 dark:border-gray-800">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
              <Coffee className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {cafe.program.stampsRequired - (membership?.stamps || 0)} kahve daha
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ödülünüze çok yakınsınız!
            </p>
          </div>
        )}

        {/* Activity History for this Cafe */}
        {cafeActivities.length > 0 && (
          <div className="bg-white dark:bg-card rounded-xl border">
            <div className="px-4 py-3 border-b">
              <h2 className="text-sm font-medium text-foreground">Geçmiş</h2>
            </div>
            <div className="divide-y">
              {cafeActivities.map((activity) => {
                const isEarn = activity.type === 'earn';
                return (
                  <div key={activity.id} className="flex items-center gap-3 py-3 px-4">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isEarn
                          ? 'bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {isEarn ? (
                        <Plus className="w-3.5 h-3.5 stroke-[2]" />
                      ) : (
                        <Minus className="w-3.5 h-3.5 stroke-[2]" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">
                        {isEarn
                          ? `+${activity.delta} damga`
                          : `${Math.abs(activity.delta)} damga kullanıldı`}
                      </p>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      {formatRelativeTime(activity.createdAt)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}