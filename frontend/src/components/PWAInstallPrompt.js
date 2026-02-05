import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone, Share, ExternalLink } from 'lucide-react';

// Detect device type
const getDeviceInfo = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
  const isAndroid = /android/i.test(userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
  const isChrome = /chrome/i.test(userAgent) && !/edge/i.test(userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                       window.navigator.standalone === true;
  return { isIOS, isAndroid, isSafari, isChrome, isStandalone, isMobile: isIOS || isAndroid };
};

// Store for the deferred prompt globally
let globalDeferredPrompt = null;

// Listen for beforeinstallprompt globally
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    globalDeferredPrompt = e;
  });
}

// Universal Install Modal - Works for ALL browsers
export const InstallModal = ({ isOpen, onClose }) => {
  const { isIOS, isAndroid, isChrome, isSafari } = getDeviceInfo();
  
  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    if (globalDeferredPrompt) {
      globalDeferredPrompt.prompt();
      const { outcome } = await globalDeferredPrompt.userChoice;
      if (outcome === 'accepted') {
        onClose();
      }
      globalDeferredPrompt = null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <img src="/altaj-logo.png" alt="Al Taj" className="h-14 w-14 rounded-xl shadow-md" />
            <div>
              <h3 className="font-bold text-xl text-gray-800">Install Al Taj App</h3>
              <p className="text-sm text-gray-500">Quick access from your home screen</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* If native prompt is available (Android Chrome) */}
        {globalDeferredPrompt && (
          <div className="mb-4">
            <Button 
              onClick={handleNativeInstall}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-lg"
            >
              <Download className="h-5 w-5 mr-2" />
              Install Now
            </Button>
            <p className="text-center text-xs text-gray-500 mt-2">One tap install</p>
          </div>
        )}

        {/* iOS Instructions */}
        {isIOS && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-orange-600 bg-orange-50 p-2 rounded-lg text-center">
              📱 Follow these steps in Safari:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="bg-orange-500 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center">1</div>
                <div>
                  <p className="font-medium">Tap the Share button</p>
                  <p className="text-xs text-gray-500">Bottom of Safari (square with arrow)</p>
                </div>
                <Share className="h-6 w-6 text-blue-500 ml-auto" />
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="bg-orange-500 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center">2</div>
                <div>
                  <p className="font-medium">Tap "Add to Home Screen"</p>
                  <p className="text-xs text-gray-500">Scroll down in the menu</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="bg-orange-500 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center">3</div>
                <div>
                  <p className="font-medium">Tap "Add"</p>
                  <p className="text-xs text-gray-500">App icon will appear on home screen</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Android (non-Chrome) Instructions */}
        {isAndroid && !globalDeferredPrompt && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-orange-600 bg-orange-50 p-2 rounded-lg text-center">
              📱 Follow these steps:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="bg-orange-500 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center">1</div>
                <div>
                  <p className="font-medium">Tap browser menu (⋮)</p>
                  <p className="text-xs text-gray-500">Three dots at top right</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="bg-orange-500 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center">2</div>
                <div>
                  <p className="font-medium">Tap "Add to Home screen"</p>
                  <p className="text-xs text-gray-500">or "Install app"</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="bg-orange-500 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center">3</div>
                <div>
                  <p className="font-medium">Tap "Add" or "Install"</p>
                  <p className="text-xs text-gray-500">App will be added to your home screen</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Instructions */}
        {!isIOS && !isAndroid && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-orange-600 bg-orange-50 p-2 rounded-lg text-center">
              💻 Install on Desktop:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="bg-orange-500 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center">1</div>
                <div>
                  <p className="font-medium">Look for install icon</p>
                  <p className="text-xs text-gray-500">In address bar (Chrome/Edge) or menu</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="bg-orange-500 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center">2</div>
                <div>
                  <p className="font-medium">Click "Install" when prompted</p>
                  <p className="text-xs text-gray-500">App will open in its own window</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t">
          <Button onClick={onClose} variant="outline" className="w-full">
            Got it!
          </Button>
        </div>
      </div>
    </div>
  );
};

// Main Install Banner - Shows at top
export const InstallBanner = () => {
  const [show, setShow] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { isStandalone } = getDeviceInfo();

  useEffect(() => {
    if (isStandalone) return;
    
    const dismissedTime = localStorage.getItem('install-banner-dismissed');
    if (dismissedTime && Date.now() - parseInt(dismissedTime) < 24 * 60 * 60 * 1000) {
      return;
    }
    
    // Show immediately
    setTimeout(() => setShow(true), 500);
  }, [isStandalone]);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('install-banner-dismissed', Date.now().toString());
  };

  if (!show || isStandalone) return null;

  return (
    <>
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-4" data-testid="install-banner">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Smartphone className="h-6 w-6 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm md:text-base">Get Al Taj App on your phone!</p>
              <p className="text-xs text-orange-100 hidden sm:block">Order food faster • Works offline</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              className="bg-white text-orange-600 hover:bg-orange-50 font-bold"
              onClick={() => setShowModal(true)}
            >
              <Download className="h-4 w-4 mr-1" /> Install
            </Button>
            <button onClick={handleDismiss} className="text-white/80 hover:text-white p-1">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      <InstallModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};

// Header Install Button - Always visible
export const HeaderInstallButton = () => {
  const [showModal, setShowModal] = useState(false);
  const { isStandalone } = getDeviceInfo();

  if (isStandalone) return null;

  return (
    <>
      <Button 
        onClick={() => setShowModal(true)}
        size="sm"
        className="bg-white text-orange-600 hover:bg-orange-50 font-bold shadow-md"
        data-testid="header-install-btn"
      >
        <Download className="h-4 w-4 mr-1" />
        <span>Get App</span>
      </Button>
      <InstallModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};

// Floating Install Button - Always visible
export const FloatingInstallButton = () => {
  const [showModal, setShowModal] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const { isStandalone } = getDeviceInfo();

  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(true), 3000);
    const hideTimer = setTimeout(() => setShowTooltip(false), 8000);
    return () => { clearTimeout(timer); clearTimeout(hideTimer); };
  }, []);

  if (isStandalone) return null;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50" data-testid="floating-install-btn">
        {showTooltip && (
          <div className="absolute bottom-full right-0 mb-2 bg-gray-900 text-white text-sm py-2 px-3 rounded-lg shadow-lg whitespace-nowrap">
            <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
            📲 Install our app!
          </div>
        )}
        
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
          style={{ boxShadow: '0 4px 20px rgba(234, 88, 12, 0.4)' }}
        >
          <Download className="h-6 w-6" />
        </button>
      </div>
      <InstallModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};

// Footer Install Section
export const FooterInstallSection = () => {
  const [showModal, setShowModal] = useState(false);
  const { isStandalone } = getDeviceInfo();

  if (isStandalone) return null;

  return (
    <>
      <div className="bg-orange-50 border-t-2 border-orange-200 py-6 px-4" data-testid="footer-install-section">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Smartphone className="h-8 w-8 text-orange-600" />
            <h3 className="text-xl font-bold text-gray-800">Download Al Taj App</h3>
          </div>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            Get exclusive offers, faster ordering, and real-time order tracking!
          </p>
          <Button 
            onClick={() => setShowModal(true)}
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-8"
          >
            <Download className="h-5 w-5 mr-2" />
            Install Free App
          </Button>
          <p className="text-xs text-gray-500 mt-3">No app store needed • Installs in seconds</p>
        </div>
      </div>
      <InstallModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};

// Main export
const PWAInstallPrompt = () => {
  return <FloatingInstallButton />;
};

export default PWAInstallPrompt;
