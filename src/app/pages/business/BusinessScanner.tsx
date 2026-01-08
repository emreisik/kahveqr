import { useState, useEffect, useRef } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Scan, Coffee, Gift, Check, Camera, Keyboard, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { getCurrentBusinessUser } from '@/lib/store';
import { Html5Qrcode } from 'html5-qrcode';
import '../../pages/scanner.css';

export function BusinessScanner() {
  const businessUser = getCurrentBusinessUser();
  const [qrInput, setQrInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const qrInputRef = useRef<HTMLTextAreaElement>(null);
  const scanModeRef = useRef(scanMode);
  const isProcessingRef = useRef(false);
  const lastScannedQRRef = useRef<string>('');

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    scanModeRef.current = scanMode;
    // Reset processing flags when switching modes
    isProcessingRef.current = false;
    lastScannedQRRef.current = '';
    
    if (scanMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
  }, [scanMode]);

  const handleAutoScan = async (decodedText: string) => {
    console.log('🔍 handleAutoScan called');
    
    // CRITICAL: Prevent multiple scans with strict checking
    if (isProcessingRef.current) {
      console.log('⏸️ Already processing, ignoring');
      return;
    }
    
    // CRITICAL: Prevent same QR code being scanned again
    if (lastScannedQRRef.current === decodedText) {
      console.log('⏸️ Same QR code, ignoring');
      return;
    }
    
    console.log('🎯 Processing new QR code');
    
    // CRITICAL: Mark as processing IMMEDIATELY
    isProcessingRef.current = true;
    lastScannedQRRef.current = decodedText;
    
    // CRITICAL: Stop camera IMMEDIATELY before any async operations
    console.log('🛑 Stopping camera');
    stopCamera();
    
    setQrInput(decodedText);
    
    // Automatically determine action based on QR data
    try {
      const qrData = JSON.parse(decodedText);
      const action = qrData.reward ? 'redeem' : 'stamp';
      
      console.log('✅ QR data parsed, action:', action);
      toast.info(`QR kod okundu - İşlem yapılıyor...`);
      
      // Process immediately
      handleScan(action);
    } catch (error) {
      // If can't parse, default to stamp
      console.log('⚠️ Could not parse QR data, defaulting to stamp');
      toast.info('QR kod okundu - İşlem yapılıyor...');
      handleScan('stamp');
    }
  };

  const startCamera = async () => {
    // Don't start camera if processing
    if (isProcessingRef.current) {
      console.log('⏸️ Still processing, waiting...');
      return;
    }
    
    setIsCameraLoading(true);
    
    try {
      console.log('📷 Starting camera...');
      
      // If already running, stop first
      if (isCameraActive) {
        console.log('🔄 Camera already active, restarting...');
        stopCamera();
        // Wait a bit before restarting
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (!html5QrCodeRef.current) {
        console.log('🆕 Creating new Html5Qrcode instance');
        html5QrCodeRef.current = new Html5Qrcode('qr-reader');
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      console.log('🎥 Requesting camera access...');
      
      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          console.log('✅ QR Code detected:', decodedText.substring(0, 50) + '...');
          // CRITICAL: Single callback execution
          handleAutoScan(decodedText);
        },
        (errorMessage) => {
          // Ignore scan errors (they happen constantly while scanning)
        }
      );

      setIsCameraActive(true);
      setIsCameraLoading(false);
      console.log('✅ Camera started successfully');
      toast.success('Kamera hazır - QR kodu tarayabilirsiniz');
      
    } catch (error: any) {
      console.error('❌ Camera error:', error);
      setIsCameraLoading(false);
      toast.error('Kamera başlatılamadı', {
        description: 'Kamera iznini kontrol edin veya Manuel moda geçin'
      });
      setScanMode('manual');
    }
  };

  const stopCamera = () => {
    try {
      if (html5QrCodeRef.current && isCameraActive) {
        console.log('🛑 Stopping camera...');
        html5QrCodeRef.current.stop();
        setIsCameraActive(false);
        console.log('✅ Camera stopped');
      }
    } catch (error) {
      console.error('❌ Error stopping camera:', error);
      setIsCameraActive(false);
    }
  };

  const handleScan = async (action: 'stamp' | 'redeem') => {
    if (!qrInput.trim()) {
      toast.error('QR kod verisi gerekli');
      return;
    }

    if (!businessUser?.cafeId) {
      toast.error('İşletme bilgisi bulunamadı');
      return;
    }

    // Mark as processing for manual mode too
    isProcessingRef.current = true;

    setLoading(true);
    setLastResult(null);

    try {
      const token = localStorage.getItem('kahveqr_auth_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      
      const endpoint = action === 'stamp' ? '/scan/stamp' : '/scan/redeem';
      const body: any = { qrData: qrInput };
      
      if (action === 'stamp') {
        body.cafeId = businessUser.cafeId;
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

      setLastResult(data);
      setShowSuccessOverlay(true);
      
      // Play success sound
      const audio = new Audio('data:audio/wav;base64,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');
      audio.play().catch(() => {});

      // Clear QR input
      setQrInput('');

      // Auto-hide success overlay and restart camera
      setTimeout(() => {
        setShowSuccessOverlay(false);
        // Reset processing flags
        isProcessingRef.current = false;
        lastScannedQRRef.current = '';
        // Automatically restart camera only if still in camera mode
        if (scanModeRef.current === 'camera') {
          startCamera();
        }
      }, 3000);

    } catch (error: any) {
      toast.error('İşlem başarısız', {
        description: error.message,
      });
      
      // Reset processing flags on error and restart camera after delay
      setTimeout(() => {
        isProcessingRef.current = false;
        lastScannedQRRef.current = '';
        setQrInput('');
        
        // Restart camera if in camera mode
        if (scanModeRef.current === 'camera') {
          startCamera();
        }
      }, 2000);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccessOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-12 max-w-md w-full mx-4 shadow-2xl"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                  className="relative mx-auto mb-8"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-green-500"
                    style={{ width: '200px', height: '200px', margin: '-20px' }}
                  />
                  <div className="relative w-40 h-40 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-24 h-24 text-white" strokeWidth={3} />
                  </div>
                </motion.div>

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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          QR Kod Tarama
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Müşteri QR kodlarını tarayarak damga ekleyin veya ödül kullanın
        </p>
      </div>

      {/* Scanner Card */}
      <Card className="p-8 border-2 max-w-2xl mx-auto">
        {/* Mode Toggle */}
        <div className="mb-6">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={scanMode === 'camera' ? 'default' : 'outline'}
              className="flex-1 h-12"
              onClick={() => setScanMode('camera')}
            >
              <Camera className="w-5 h-5 mr-2" />
              Kamera
            </Button>
            <Button
              type="button"
              variant={scanMode === 'manual' ? 'default' : 'outline'}
              className="flex-1 h-12"
              onClick={() => setScanMode('manual')}
            >
              <Keyboard className="w-5 h-5 mr-2" />
              Manuel
            </Button>
          </div>
        </div>

        {/* Camera or Manual Input */}
        <div className="mb-6">
          {scanMode === 'camera' ? (
            <div>
              <label className="block text-sm font-medium mb-3">
                Kamera ile Tara
              </label>
              <div className="relative">
                <div 
                  id="qr-reader" 
                  className="w-full rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700"
                  style={{ minHeight: '300px' }}
                />
                {isCameraLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                    <div className="text-center text-white">
                      <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-sm font-medium">Kamera açılıyor...</p>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                {isCameraActive ? '✅ QR kodu kameranın önüne tutun' : '📸 Kamera hazırlanıyor...'}
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-3">
                QR Kod Verisi
              </label>
              <Textarea
                ref={qrInputRef}
                placeholder='{"type":"user","userId":"...","timestamp":...}'
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                rows={4}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Müşteri QR kodunu yapıştırın
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => handleScan('stamp')}
            disabled={loading || !qrInput}
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
            {loading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <>
                <Gift className="w-5 h-5 mr-2" />
                Ödül Kullan
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}

