import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

export function CustomerOnboarding() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Full Screen Video Background */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="https://videos.pexels.com/video-files/4828604/4828604-sd_960_506_25fps.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border-2 border-white/20">
            {/* QR Code with Stylized Coffee Bean */}
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* QR Grid Pattern */}
              <rect x="2" y="2" width="16" height="16" fill="white" rx="3"/>
              <rect x="6" y="6" width="8" height="8" fill="white" rx="1.5" opacity="0.3"/>
              
              <rect x="34" y="2" width="16" height="16" fill="white" rx="3"/>
              <rect x="38" y="6" width="8" height="8" fill="white" rx="1.5" opacity="0.3"/>
              
              <rect x="2" y="34" width="16" height="16" fill="white" rx="3"/>
              <rect x="6" y="38" width="8" height="8" fill="white" rx="1.5" opacity="0.3"/>
              
              {/* QR Data dots */}
              <circle cx="24" cy="6" r="2" fill="white"/>
              <circle cx="30" cy="6" r="2" fill="white"/>
              <circle cx="6" cy="24" r="2" fill="white"/>
              <circle cx="6" cy="30" r="2" fill="white"/>
              <circle cx="46" cy="24" r="2" fill="white"/>
              <circle cx="46" cy="30" r="2" fill="white"/>
              <circle cx="24" cy="46" r="2" fill="white"/>
              <circle cx="30" cy="46" r="2" fill="white"/>
              <circle cx="34" cy="34" r="2" fill="white"/>
              <circle cx="42" cy="42" r="2" fill="white"/>
              <circle cx="34" cy="42" r="2" fill="white"/>
              
              {/* Beautiful Coffee Bean Center */}
              <g transform="translate(26, 26)">
                {/* Bean shadow/depth */}
                <ellipse cx="0.5" cy="0.5" rx="8.5" ry="12" fill="white" opacity="0.3" transform="rotate(-18)"/>
                {/* Main bean */}
                <ellipse cx="0" cy="0" rx="8" ry="11.5" fill="white" transform="rotate(-18)"/>
                {/* Bean line with curve */}
                <path d="M -1.5 -9.5 Q -0.5 -3 0 0 Q 0.5 3 1.5 9.5" 
                      stroke="rgba(0,0,0,0.15)" 
                      strokeWidth="2" 
                      strokeLinecap="round"
                      fill="none"/>
                {/* Highlight */}
                <ellipse cx="-2" cy="-4" rx="2" ry="3.5" fill="white" opacity="0.4" transform="rotate(-18 -2 -4)"/>
              </g>
            </svg>
          </div>
          <h1 className="font-bold text-white text-4xl tracking-tight">KahveQR</h1>
          <p className="text-white/90 text-lg font-medium">Tüm kartlarınız, tek yerde</p>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-sm mt-12 space-y-3">
          <Button
            onClick={handleStart}
            size="lg"
            className="w-full h-14 bg-white hover:bg-white/90 text-gray-900 font-semibold rounded-xl shadow-xl text-base"
          >
            Müşteri Girişi
          </Button>
          <Button
            onClick={() => navigate('/business-login')}
            size="lg"
            variant="outline"
            className="w-full h-14 bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 font-semibold rounded-xl backdrop-blur-sm text-base"
          >
            İşletme Girişi
          </Button>
          <p className="text-white/70 text-xs text-center mt-4">
            Müşteri misiniz yoksa işletme sahibi mi?
          </p>
        </div>
      </div>
    </div>
  );
}