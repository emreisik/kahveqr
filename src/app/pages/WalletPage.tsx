import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getState, getCafes } from '@/lib/store';
import { Coffee, Wallet } from 'lucide-react';
import { motion } from 'motion/react';
import { Cafe } from '@/lib/types';

export function WalletPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<any>(null);
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [stateData, cafesData] = await Promise.all([
          getState(),
          getCafes(),
        ]);
        setState(stateData);
        setCafes(cafesData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 2000); // Reload every 2 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading || !state) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black flex items-center justify-center">
        <div className="text-center">
          <Coffee className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600 dark:text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const cardsData = state.memberships.map((membership: any) => {
    const brand = membership.brand;
    if (!brand) return null;

    const progress = (membership.stamps / brand.stampsRequired) * 100;
    const isCompleted = membership.stamps >= brand.stampsRequired;
    const isEmpty = membership.stamps === 0;

    return {
      brand,
      membership,
      progress,
      isCompleted,
      isEmpty,
    };
  }).filter(Boolean);

  // Card color schemes based on cafe
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black pb-24">
      {/* Minimal Header */}
      <header className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="flex items-center justify-center h-16 px-4 max-w-lg mx-auto">
          <Wallet className="w-5 h-5 text-gray-700 dark:text-gray-300 mr-2" />
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Cüzdanım</h1>
        </div>
      </header>

      <main className="pt-8 px-6 max-w-lg mx-auto space-y-6">
        {cardsData.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center py-20"
          >
            {/* Icon */}
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <Coffee className="w-10 h-10 text-gray-400 dark:text-gray-600" />
            </div>

            {/* Text */}
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Henüz sadakat kartınız yok
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              QR kodunuzu okutarak ilk kartınızı alın
            </p>

            {/* CTA Button */}
            <button
              onClick={() => navigate('/qr')}
              className="inline-flex items-center gap-2 bg-foreground hover:bg-foreground/90 text-background font-medium py-2.5 px-6 rounded-xl transition-all"
            >
              <Coffee className="w-4 h-4" />
              QR Kodumu Göster
            </button>
          </motion.div>
        ) : (
          <div className="space-y-5">
            {cardsData.map((data) => {
              if (!data) return null;
              const { brand, membership, progress, isCompleted, isEmpty } = data;
              const style = getCardStyle(brand.id);

              return (
                <motion.div
                  key={brand.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: cardsData.indexOf(data) * 0.1,
                    ease: [0.25, 0.1, 0.25, 1]
                  }}
                  onClick={() => navigate(`/cafe/${brand.id}`)}
                  className="group cursor-pointer"
                >
                  {/* Credit Card Style */}
                  <div 
                    className={`
                      relative w-full aspect-[1.586/1] rounded-2xl 
                      bg-gradient-to-br ${style.gradient}
                      shadow-2xl hover:shadow-3xl
                      transform transition-all duration-500 ease-out
                      hover:scale-[1.02] hover:-translate-y-1
                      overflow-hidden
                    `}
                  >
                    {/* Card Overlay Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-32 translate-x-32" />
                    
                    {/* Card Content */}
                    <div className="relative h-full flex flex-col justify-between p-6">
                      {/* Top Section */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-2xl font-bold text-white tracking-tight">
                            {brand.name}
                          </h3>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Coffee className="w-6 h-6 text-white" />
                        </div>
                      </div>

                      {/* Coffee Cups Visualization */}
                      <div className="my-4">
                        <div className={`grid gap-1.5 ${brand.stampsRequired === 8 ? 'grid-cols-8' : 'grid-cols-10'}`}>
                          {Array.from({ length: brand.stampsRequired }).map((_, idx) => {
                            const isFilled = idx < membership.stamps;
                            return (
                              <div
                                key={idx}
                                className={`
                                  transition-all duration-300 ease-out flex items-center justify-center
                                  ${isFilled ? 'scale-100' : 'scale-90'}
                                `}
                              >
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  className={`
                                    transition-all duration-500
                                    ${isFilled ? 'opacity-100' : 'opacity-30'}
                                  `}
                                >
                                  {/* Coffee cup icon */}
                                  <path
                                    d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    fill={isFilled ? 'white' : 'none'}
                                    className="transition-all duration-500"
                                  />
                                  {/* Steam effect for filled cups */}
                                  {isFilled && (
                                    <>
                                      <path
                                        d="M7 3 L7 5"
                                        stroke="white"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        opacity="0.7"
                                      />
                                      <path
                                        d="M10 2 L10 4"
                                        stroke="white"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        opacity="0.5"
                                      />
                                      <path
                                        d="M13 3 L13 5"
                                        stroke="white"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        opacity="0.7"
                                      />
                                    </>
                                  )}
                                </svg>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Bottom Section */}
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xs text-white/70 mb-1 font-medium">
                            İlerleme
                          </p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-white">
                              {membership.stamps}
                            </span>
                            <span className="text-lg text-white/60">
                              / {brand.stampsRequired}
                            </span>
                          </div>
                        </div>
                        
                        {isCompleted && (
                          <div className="px-4 py-2 bg-white/30 backdrop-blur-md rounded-full animate-pulse">
                            <span className="text-sm font-bold text-white">
                              ✓ Hazır
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                        <div
                          className="h-full bg-white/60 transition-all duration-700 ease-out"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -translate-x-full group-hover:translate-x-full transform" 
                         style={{ transition: 'transform 1.5s ease-out, opacity 0.3s ease-out' }} 
                    />
                  </div>

                  {/* Card Sub-info */}
                  <div className="mt-3 px-1 flex items-center justify-between">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {brand.rewardName}
                    </p>
                    {isCompleted && (
                      <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                        🎁 Ödül kazandınız!
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}