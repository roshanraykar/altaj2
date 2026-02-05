import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone } from 'lucide-react';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                       window.navigator.standalone === true;
    setIsStandalone(standalone);

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // Listen for the beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after a delay
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Show iOS prompt after delay if on iOS and not installed
    if (iOS && !standalone) {
      const dismissed = localStorage.getItem('pwa-ios-dismissed');
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 5000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installed');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    if (isIOS) {
      localStorage.setItem('pwa-ios-dismissed', 'true');
    }
  };

  // Don't show if already installed
  if (isStandalone || !showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-2xl shadow-2xl border-2 border-orange-200 p-4 z-50 animate-slide-up" data-testid="pwa-install-prompt">
      <button 
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        <X className="h-5 w-5" />
      </button>
      
      <div className="flex items-start gap-4">
        <div className="bg-orange-100 p-3 rounded-xl">
          <Smartphone className="h-8 w-8 text-orange-600" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 mb-1">Install Al Taj App</h3>
          <p className="text-sm text-gray-600 mb-3">
            {isIOS 
              ? "Tap the share button and select 'Add to Home Screen'"
              : "Get quick access to order food anytime!"}
          </p>
          
          {isIOS ? (
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
              <p>1. Tap <span className="inline-block">⬆️</span> Share button</p>
              <p>2. Scroll and tap "Add to Home Screen"</p>
              <p>3. Tap "Add"</p>
            </div>
          ) : (
            <Button 
              onClick={handleInstallClick}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Install Now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
