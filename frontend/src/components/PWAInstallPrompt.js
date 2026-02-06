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

// App Store URLs - Update these when apps are published
const APP_STORE_URLS = {
  android: null, // e.g., "https://play.google.com/store/apps/details?id=com.altaj.restaurant"
  ios: null, // e.g., "https://apps.apple.com/app/al-taj-restaurant/id123456789"
};

// Universal Install Modal - Shows App Download Options
export const InstallModal = ({ isOpen, onClose }) => {
  const { isIOS, isAndroid } = getDeviceInfo();
  
  if (!isOpen) return null;

  const handleAndroidDownload = () => {
    if (APP_STORE_URLS.android) {
      window.open(APP_STORE_URLS.android, '_blank');
    }
  };

  const handleIOSDownload = () => {
    if (APP_STORE_URLS.ios) {
      window.open(APP_STORE_URLS.ios, '_blank');
    }
  };

  const androidAvailable = !!APP_STORE_URLS.android;
  const iosAvailable = !!APP_STORE_URLS.ios;
  const appsComingSoon = !androidAvailable && !iosAvailable;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <img src="/altaj-logo.png" alt="Al Taj" className="h-14 w-14 rounded-xl shadow-md object-contain" />
            <div>
              <h3 className="font-bold text-xl text-gray-800">Download Al Taj App</h3>
              <p className="text-sm text-gray-500">Order food faster on your phone</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Android Download Button */}
          <button
            onClick={handleAndroidDownload}
            disabled={!androidAvailable}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
              androidAvailable 
                ? 'border-green-200 bg-green-50 hover:bg-green-100 hover:border-green-300 cursor-pointer' 
                : 'border-gray-200 bg-gray-50 cursor-not-allowed'
            }`}
          >
            <div className={`p-3 rounded-xl ${androidAvailable ? 'bg-green-500' : 'bg-gray-400'}`}>
              <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.523 15.341a.5.5 0 0 0 0-.682l-1.006-1.006a.5.5 0 0 0-.707 0l-1.362 1.362-1.362-1.362a.5.5 0 0 0-.707 0l-1.006 1.006a.5.5 0 0 0 0 .682l1.362 1.362-1.362 1.362a.5.5 0 0 0 0 .707l1.006 1.006a.5.5 0 0 0 .707 0l1.362-1.362 1.362 1.362a.5.5 0 0 0 .707 0l1.006-1.006a.5.5 0 0 0 0-.707l-1.362-1.362 1.362-1.362zM6 18c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V8H6v10zM7.5 8.5v9h9v-9h-9zm7-5.5L16 4.5V6h-2V4.5L12.5 3h-1L10 4.5V6H8V4.5L9.5 3h-1L7 4.5V6H5v2h14V6h-2V4.5L15.5 3h-1z"/>
                <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm0 12h2v-2H3v2zM21 9h-2v2h2V9zm0 4h-2v2h2v-2zm0 4h-2v2h2v-2zm0-12h-2v2h2V5z"/>
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className={`font-bold text-lg ${androidAvailable ? 'text-gray-800' : 'text-gray-500'}`}>
                Android App
              </p>
              <p className={`text-sm ${androidAvailable ? 'text-green-600' : 'text-gray-400'}`}>
                {androidAvailable ? 'Download from Play Store' : 'Coming Soon'}
              </p>
            </div>
            {androidAvailable && (
              <ExternalLink className="h-5 w-5 text-green-600" />
            )}
          </button>

          {/* iOS Download Button */}
          <button
            onClick={handleIOSDownload}
            disabled={!iosAvailable}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
              iosAvailable 
                ? 'border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 cursor-pointer' 
                : 'border-gray-200 bg-gray-50 cursor-not-allowed'
            }`}
          >
            <div className={`p-3 rounded-xl ${iosAvailable ? 'bg-black' : 'bg-gray-400'}`}>
              <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className={`font-bold text-lg ${iosAvailable ? 'text-gray-800' : 'text-gray-500'}`}>
                iOS App
              </p>
              <p className={`text-sm ${iosAvailable ? 'text-blue-600' : 'text-gray-400'}`}>
                {iosAvailable ? 'Download from App Store' : 'Coming Soon'}
              </p>
            </div>
            {iosAvailable && (
              <ExternalLink className="h-5 w-5 text-blue-600" />
            )}
          </button>
        </div>

        {/* Spacer */}

        <div className="mt-6 pt-4 border-t">
          <Button onClick={onClose} variant="outline" className="w-full">
            Close
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
          <p className="text-xs text-gray-500 mt-3">Download from Play Store or App Store</p>
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
