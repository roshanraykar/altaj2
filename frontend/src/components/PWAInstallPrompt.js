import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone, Share, ChevronUp } from 'lucide-react';

// Detect device type
const getDeviceInfo = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
  const isAndroid = /android/i.test(userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                       window.navigator.standalone === true;
  return { isIOS, isAndroid, isStandalone, isMobile: isIOS || isAndroid };
};

// Main Install Banner - Shows at top immediately
export const InstallBanner = ({ onDismiss }) => {
  const [show, setShow] = useState(false);
  const { isIOS, isAndroid, isStandalone, isMobile } = getDeviceInfo();
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Don't show if already installed
    if (isStandalone) return;
    
    // Check if dismissed recently (within 24 hours)
    const dismissedTime = localStorage.getItem('install-banner-dismissed');
    if (dismissedTime && Date.now() - parseInt(dismissedTime) < 24 * 60 * 60 * 1000) {
      return;
    }

    // Show immediately
    setShow(true);

    // Capture the install prompt for Android
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, [isStandalone]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShow(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('install-banner-dismissed', Date.now().toString());
    if (onDismiss) onDismiss();
  };

  if (!show || isStandalone) return null;

  return (
    <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-4 relative" data-testid="install-banner">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Smartphone className="h-6 w-6 flex-shrink-0" />
          <div>
            <p className="font-bold text-sm md:text-base">Get Al Taj App on your phone!</p>
            <p className="text-xs text-orange-100 hidden sm:block">Order food faster with our app</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isIOS ? (
            <Button 
              size="sm" 
              className="bg-white text-orange-600 hover:bg-orange-50 font-bold"
              onClick={() => document.getElementById('ios-install-modal')?.classList.remove('hidden')}
            >
              <Share className="h-4 w-4 mr-1" /> Install
            </Button>
          ) : (
            <Button 
              size="sm" 
              className="bg-white text-orange-600 hover:bg-orange-50 font-bold"
              onClick={handleInstall}
            >
              <Download className="h-4 w-4 mr-1" /> Install App
            </Button>
          )}
          <button onClick={handleDismiss} className="text-white/80 hover:text-white p-1">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Header Install Button
export const HeaderInstallButton = () => {
  const { isIOS, isStandalone } = getDeviceInfo();
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    } else if (isIOS) {
      document.getElementById('ios-install-modal')?.classList.remove('hidden');
    }
  };

  if (isStandalone) return null;

  return (
    <Button 
      onClick={handleInstall}
      size="sm"
      className="bg-white/20 hover:bg-white/30 text-white border border-white/30 font-semibold"
      data-testid="header-install-btn"
    >
      <Download className="h-4 w-4 mr-1" />
      <span className="hidden sm:inline">Get App</span>
    </Button>
  );
};

// Floating Install Button
export const FloatingInstallButton = () => {
  const { isIOS, isStandalone } = getDeviceInfo();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    
    // Show tooltip after 5 seconds
    const timer = setTimeout(() => setShowTooltip(true), 5000);
    // Hide tooltip after 10 seconds
    const hideTimer = setTimeout(() => setShowTooltip(false), 10000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleInstall = async () => {
    setShowTooltip(false);
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    } else if (isIOS) {
      document.getElementById('ios-install-modal')?.classList.remove('hidden');
    }
  };

  if (isStandalone) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50" data-testid="floating-install-btn">
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full right-0 mb-2 bg-gray-900 text-white text-sm py-2 px-3 rounded-lg shadow-lg whitespace-nowrap animate-bounce">
          <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
          📲 Install our app!
        </div>
      )}
      
      {/* Button */}
      <button
        onClick={handleInstall}
        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
        style={{ boxShadow: '0 4px 20px rgba(234, 88, 12, 0.4)' }}
      >
        <Download className="h-6 w-6" />
      </button>
    </div>
  );
};

// Footer Install Section
export const FooterInstallSection = () => {
  const { isIOS, isStandalone } = getDeviceInfo();
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    } else if (isIOS) {
      document.getElementById('ios-install-modal')?.classList.remove('hidden');
    }
  };

  if (isStandalone) return null;

  return (
    <div className="bg-orange-50 border-t-2 border-orange-200 py-6 px-4" data-testid="footer-install-section">
      <div className="container mx-auto text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Smartphone className="h-8 w-8 text-orange-600" />
          <h3 className="text-xl font-bold text-gray-800">Download Al Taj App</h3>
        </div>
        <p className="text-gray-600 mb-4 max-w-md mx-auto">
          Get exclusive offers, faster ordering, and real-time order tracking on your phone!
        </p>
        <Button 
          onClick={handleInstall}
          size="lg"
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-8"
        >
          <Download className="h-5 w-5 mr-2" />
          {isIOS ? 'Add to Home Screen' : 'Install Free App'}
        </Button>
        <p className="text-xs text-gray-500 mt-3">No app store needed • Installs in seconds</p>
      </div>
    </div>
  );
};

// iOS Installation Modal
export const IOSInstallModal = () => {
  const closeModal = () => {
    document.getElementById('ios-install-modal')?.classList.add('hidden');
  };

  return (
    <div id="ios-install-modal" className="hidden fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50" onClick={closeModal}>
      <div className="bg-white rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-md m-0 sm:m-4 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <img src="/altaj-logo.png" alt="Al Taj" className="h-12 w-12 rounded-xl" />
            <div>
              <h3 className="font-bold text-lg">Install Al Taj App</h3>
              <p className="text-sm text-gray-500">Add to your home screen</p>
            </div>
          </div>
          <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-xl">
            <div className="bg-orange-100 text-orange-600 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">1</div>
            <div>
              <p className="font-medium">Tap the Share button</p>
              <p className="text-sm text-gray-500">At the bottom of your Safari browser</p>
              <div className="mt-2 text-2xl">
                <Share className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-xl">
            <div className="bg-orange-100 text-orange-600 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">2</div>
            <div>
              <p className="font-medium">Scroll & tap "Add to Home Screen"</p>
              <p className="text-sm text-gray-500">You may need to scroll down in the menu</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-xl">
            <div className="bg-orange-100 text-orange-600 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">3</div>
            <div>
              <p className="font-medium">Tap "Add" to confirm</p>
              <p className="text-sm text-gray-500">The app icon will appear on your home screen</p>
            </div>
          </div>
        </div>

        <Button onClick={closeModal} className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200">
          Got it!
        </Button>
      </div>
    </div>
  );
};

// Main export - combines all install prompts
const PWAInstallPrompt = () => {
  return (
    <>
      <IOSInstallModal />
      <FloatingInstallButton />
    </>
  );
};

export default PWAInstallPrompt;
