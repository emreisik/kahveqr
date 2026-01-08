import { useState, useEffect, useRef } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Scan, Coffee, Gift, Check, X, TrendingUp, Users, Award, Clock, Store, Camera, Keyboard, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { getCafes, logout, getCurrentBusinessUser } from '@/lib/store';
import { Cafe } from '@/lib/types';
import { Html5Qrcode } from 'html5-qrcode';
import './scanner.css';

interface Transaction {
  id: string;
  type: 'stamp' | 'redeem';
  userName: string;
  cafeName: string;
  stamps: string;
  time: Date;
}

export function ScannerPage() {
  const [qrInput, setQrInput] = useState('');
  const [selectedCafe, setSelectedCafe] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [todayStats, setTodayStats] = useState({ stamps: 0, redeems: 0, customers: 0 });
  const qrInputRef = useRef<HTMLTextAreaElement>(null);
  const [businessCafeId, setBusinessCafeId] = useState<string | null>(null);
  const [businessCafeName, setBusinessCafeName] = useState<string>('');
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const loadCafes = async () => {
      try {
        const cafesData = await getCafes();
        setCafes(cafesData);
        
        // Check if user is business and set their cafe
        const businessUser = JSON.parse(localStorage.getItem('kahveqr-business-user') || '{}');
        if (businessUser.cafeId) {
          setBusinessCafeId(businessUser.cafeId);
          setSelectedCafe(businessUser.cafeId);
          const businessCafe = cafesData.find(c => c.id === businessUser.cafeId);
          if (businessCafe) {
            setBusinessCafeName(businessCafe.name);
          }
        } else if (cafesData.length > 0 && !selectedCafe) {
          // Auto-select first cafe if not a business user
          setSelectedCafe(cafesData[0].id);
        }
      } catch (error) {
        console.error('Failed to load cafes:', error);
      }
    };
    loadCafes();
  }, []);

  // Auto focus on QR input
  useEffect(() => {
    qrInputRef.current?.focus();
  }, [lastResult]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && e.ctrlKey && qrInput && selectedCafe && !loading) {
        e.preventDefault();
        handleScan('stamp');
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [qrInput, selectedCafe, loading]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Start/stop camera based on mode
  useEffect(() => {
    if (scanMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
  }, [scanMode]);

  const startCamera = async () => {
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('qr-reader');
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      };

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          // QR kod başarıyla okundu
          setQrInput(decodedText);
          toast.success('QR kod okundu!');
          stopCamera();
          setScanMode('manual');
        },
        (errorMessage) => {
          // Sessizce hataları yoksay (sürekli tarama sırasında normal)
        }
      );

      setIsCameraActive(true);
    } catch (error: any) {
      console.error('Camera error:', error);
      toast.error('Kamera başlatılamadı', {
        description: 'Kamera izinlerini kontrol edin',
      });
      setScanMode('manual');
    }
  };

  const stopCamera = async () => {
    try {
      if (html5QrCodeRef.current && isCameraActive) {
        await html5QrCodeRef.current.stop();
        setIsCameraActive(false);
      }
    } catch (error) {
      console.error('Error stopping camera:', error);
    }
  };

  const handleScan = async (action: 'stamp' | 'redeem') => {
    if (!qrInput.trim()) {
      toast.error('QR kod verisi gerekli');
      return;
    }

    if (action === 'stamp' && !selectedCafe) {
      toast.error('Kafe seçimi gerekli');
      return;
    }

    setLoading(true);
    setLastResult(null);

    try {
      const token = localStorage.getItem('kahveqr_auth_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      
      const endpoint = action === 'stamp' ? '/scan/stamp' : '/scan/redeem';
      const body: any = { qrData: qrInput };
      
      if (action === 'stamp') {
        body.cafeId = selectedCafe;
      }

      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'İşlem başarısız');
      }

      setLastResult({
        success: true,
        action,
        ...data,
      });

      // Add to transactions
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        type: action,
        userName: data.membership?.user?.email || 'Unknown',
        cafeName: data.membership?.cafe?.name || cafes.find(c => c.id === selectedCafe)?.name || 'Unknown',
        stamps: data.membership ? `${data.membership.stamps}/${data.membership.cafe.stampsRequired}` : '-',
        time: new Date(),
      };
      setTransactions(prev => [newTransaction, ...prev.slice(0, 9)]);

      // Update stats
      setTodayStats(prev => ({
        ...prev,
        stamps: action === 'stamp' ? prev.stamps + 1 : prev.stamps,
        redeems: action === 'redeem' ? prev.redeems + 1 : prev.redeems,
        customers: prev.customers + 1,
      }));

      // Play success sound
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // First beep (higher pitch)
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      } catch (error) {
        // Fallback: simple beep
        console.log('Audio not available');
      }

      // Show full screen success overlay
      setShowSuccessOverlay(true);
      
      // Hide after 3 seconds
      setTimeout(() => {
        setShowSuccessOverlay(false);
      }, 3000);

      // Clear input
      setQrInput('');
    } catch (error: any) {
      setLastResult({
        success: false,
        error: error.message,
      });
      toast.error('Hata', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Full Screen Success Overlay */}
      <AnimatePresence>
        {showSuccessOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-black"
          >
            <div className="text-center">
              {/* Animated Check Circle */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  delay: 0.1
                }}
                className="relative mx-auto mb-8"
              >
                {/* Outer circle with pulse */}
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.1, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 rounded-full bg-green-500"
                  style={{ width: '200px', height: '200px', margin: '-20px' }}
                />
                
                {/* Main circle */}
                <div className="relative w-40 h-40 rounded-full bg-green-500 flex items-center justify-center">
                  {/* Check icon */}
                  <motion.div
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.3,
                      ease: "easeOut"
                    }}
                  >
                    <Check className="w-24 h-24 text-white" strokeWidth={3} />
                  </motion.div>
                </div>
              </motion.div>

              {/* Success Text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Başarılı!
                </h2>
                <p className="text-lg text-muted-foreground">
                  {lastResult?.message || 'İşlem tamamlandı'}
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black">
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
          <div className="flex items-center justify-between h-16 px-4 max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <Store className="w-6 h-6 text-primary" />
              <div>
                <h1 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  İşletme Paneli
                </h1>
                <p className="text-xs text-muted-foreground">
                  {businessCafeName || 'Yükleniyor...'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
                  logout();
                }
              }}
              className="text-xs gap-2"
            >
              <LogOut className="w-4 h-4" />
              Çıkış
            </Button>
          </div>
        </header>

        <main className="pt-6 px-4 max-w-4xl mx-auto space-y-6">
          {/* Today's Stats */}
          <div className="grid grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-4 border-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Coffee className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{todayStats.stamps}</p>
                    <p className="text-xs text-muted-foreground">Damga</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-4 border-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Gift className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{todayStats.redeems}</p>
                    <p className="text-xs text-muted-foreground">Ödül</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-4 border-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{todayStats.customers}</p>
                    <p className="text-xs text-muted-foreground">Müşteri</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Main Scanner Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Scanner Form */}
            <Card className="p-6 border-2">
              <div className="flex items-center gap-2 mb-4">
                <Scan className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">QR Kod Tara</h2>
              </div>

              {/* Cafe Selection or Display */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Kafe
                </label>
                
                {businessCafeId ? (
                  // Show cafe name for business users (read-only)
                  <div className="p-3 h-12 bg-blue-50 dark:bg-blue-950/30 rounded-lg border-2 border-blue-200 dark:border-blue-800 flex items-center">
                    <Store className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                    <span className="font-semibold text-blue-900 dark:text-blue-100">
                      {businessCafeName || 'Yükleniyor...'}
                    </span>
                  </div>
                ) : (
                  // Show selector for non-business users
                  <Select value={selectedCafe} onValueChange={setSelectedCafe}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Kafe seçin..." />
                    </SelectTrigger>
                    <SelectContent>
                      {cafes.length > 0 ? (
                        cafes.map((cafe) => (
                          <SelectItem key={cafe.id} value={cafe.id}>
                            {cafe.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="loading" disabled>
                          Yükleniyor...
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Scan Mode Toggle */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={scanMode === 'camera' ? 'default' : 'outline'}
                    className="flex-1 h-10"
                    onClick={() => setScanMode('camera')}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Kamera
                  </Button>
                  <Button
                    type="button"
                    variant={scanMode === 'manual' ? 'default' : 'outline'}
                    className="flex-1 h-10"
                    onClick={() => setScanMode('manual')}
                  >
                    <Keyboard className="w-4 h-4 mr-2" />
                    Manuel
                  </Button>
                </div>
              </div>

              {/* Camera View or Manual Input */}
              <div className="mb-4">
                {scanMode === 'camera' ? (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Kamera ile Tara
                    </label>
                    <div 
                      id="qr-reader" 
                      className="w-full rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700"
                      style={{ minHeight: '300px' }}
                    />
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      📸 QR kodu kameranın önüne tutun
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      QR Kod Verisi
                    </label>
                    <Textarea
                      ref={qrInputRef}
                      placeholder='{"type":"user","userId":"...","timestamp":...}'
                      value={qrInput}
                      onChange={(e) => setQrInput(e.target.value)}
                      rows={3}
                      className="font-mono text-xs"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Müşteri QR kodunu yapıştırın
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons - Larger for touch */}
              <div className="space-y-3">
                <Button
                  onClick={() => handleScan('stamp')}
                  disabled={loading || !qrInput || !selectedCafe}
                  className="w-full h-14 text-base bg-emerald-600 hover:bg-emerald-700"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Coffee className="w-5 h-5 mr-2" />
                      Damga Ekle
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleScan('redeem')}
                  disabled={loading || !qrInput}
                  variant="outline"
                  className="w-full h-14 text-base border-2"
                >
                  <Gift className="w-5 h-5 mr-2" />
                  Ödül Kullan
                </Button>
              </div>

              {/* Keyboard Shortcut Hint */}
              <p className="text-xs text-center text-muted-foreground mt-4">
                ⌨️ Ctrl+Enter = Hızlı Damga
              </p>
            </Card>

            {/* Recent Transactions */}
            <Card className="p-6 border-2">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">Son İşlemler</h2>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Henüz işlem yok
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {transactions.map((transaction) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {transaction.type === 'stamp' ? (
                            <Coffee className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Gift className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          )}
                          <span className="font-semibold text-sm">
                            {transaction.type === 'stamp' ? 'Damga' : 'Ödül'}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {transaction.time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <p className="truncate">{transaction.userName}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span>{transaction.cafeName}</span>
                          <span className="font-mono font-semibold">{transaction.stamps}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </div>

        {/* Last Result */}
        <AnimatePresence>
          {lastResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card
                className={`p-6 border-2 ${
                  lastResult.success
                    ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      lastResult.success
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                  >
                    {lastResult.success ? (
                      <Check className="w-6 h-6 text-white" />
                    ) : (
                      <X className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`font-bold mb-1 ${
                        lastResult.success
                          ? 'text-green-900 dark:text-green-100'
                          : 'text-red-900 dark:text-red-100'
                      }`}
                    >
                      {lastResult.success ? 'Başarılı!' : 'Hata'}
                    </h3>
                    {lastResult.success ? (
                      <>
                        <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                          {lastResult.message}
                        </p>
                        {lastResult.membership && (
                          <div className="mt-3 p-3 bg-white dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-green-700 dark:text-green-300">
                                Kullanıcı:
                              </span>
                              <span className="font-semibold text-green-900 dark:text-green-100">
                                {lastResult.membership.user.email}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-green-700 dark:text-green-300">
                                Damga:
                              </span>
                              <span className="font-bold text-green-900 dark:text-green-100">
                                {lastResult.membership.stamps} / {lastResult.membership.cafe.stampsRequired}
                              </span>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-red-700 dark:text-red-300">
                        {lastResult.error}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
    </>
  );
}

