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

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-6" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border-t-4 border-[#c59433]" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with brand colors */}
        <div className="bg-gradient-to-r from-[#b2101f] to-[#e70825] px-5 py-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg text-white">Download Our App</h3>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-5">
          {/* Logo and subtitle */}
          <div className="flex items-center gap-3 mb-5">
            <img src="/altaj-logo.png" alt="Al Taj" className="h-14 w-auto object-contain" />
            <p className="text-sm text-gray-500">Order food faster on your phone</p>
          </div>

          <div className="space-y-3">
            {/* Android Download Button */}
            <button
              onClick={handleAndroidDownload}
              disabled={!androidAvailable}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                androidAvailable 
                  ? 'border-[#b2101f]/30 bg-[#b2101f]/5 hover:bg-[#b2101f]/10 cursor-pointer' 
                  : 'border-gray-200 bg-gray-50/50'
              }`}
            >
              <div className={`p-2 rounded-lg ${androidAvailable ? 'bg-[#b2101f]' : 'bg-gray-300'}`}>
                <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.6 11.4c-.1-.1-.2-.2-.3-.2l-2.4-1.4 1.6-2.6c.1-.2.1-.4-.1-.5-.2-.1-.4-.1-.5.1l-1.6 2.7-2.3-1.3V5.5c0-.2-.2-.4-.4-.4s-.4.2-.4.4v2.7l-2.3 1.3-1.6-2.7c-.1-.2-.3-.2-.5-.1-.2.1-.2.4-.1.5l1.6 2.6-2.4 1.4c-.1.1-.2.2-.3.2-.1.1-.1.3 0 .4.1.2.3.3.5.2l2.3-1.4v2.8c0 .2.2.4.4.4s.4-.2.4-.4v-2.8l2.3 1.4c.2.1.4 0 .5-.2.1-.1.1-.3 0-.4zM12 1C5.9 1 1 5.9 1 12s4.9 11 11 11 11-4.9 11-11S18.1 1 12 1zm0 20c-5 0-9-4-9-9s4-9 9-9 9 4 9 9-4 9-9 9z"/>
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className={`font-medium ${androidAvailable ? 'text-gray-800' : 'text-gray-400'}`}>
                  Android
                </p>
                <p className={`text-xs ${androidAvailable ? 'text-[#b2101f]' : 'text-gray-400'}`}>
                  {androidAvailable ? 'Get it on Play Store' : 'Coming Soon'}
                </p>
              </div>
            </button>

            {/* iOS Download Button */}
            <button
              onClick={handleIOSDownload}
              disabled={!iosAvailable}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                iosAvailable 
                  ? 'border-red-200 bg-red-50 hover:bg-red-100 cursor-pointer' 
                  : 'border-gray-200 bg-gray-50/50'
              }`}
            >
              <div className={`p-2 rounded-lg ${iosAvailable ? 'bg-gray-900' : 'bg-gray-300'}`}>
                <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className={`font-medium ${iosAvailable ? 'text-gray-800' : 'text-gray-400'}`}>
                  iOS
                </p>
                <p className={`text-xs ${iosAvailable ? 'text-gray-600' : 'text-gray-400'}`}>
                  {iosAvailable ? 'Download on App Store' : 'Coming Soon'}
                </p>
              </div>
            </button>
          </div>

          {/* Close button */}
          <Button 
            onClick={onClose} 
            variant="outline" 
            className="w-full mt-4 border-red-200 text-red-600 hover:bg-red-50"
          >
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
      <div className="bg-gradient-to-r from-[#b2101f] to-[#e70825] text-white py-2.5 px-4" data-testid="install-banner">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Smartphone className="h-5 w-5 flex-shrink-0" />
            <p className="font-medium text-sm">Download our app for a better experience</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              className="bg-white text-[#b2101f] hover:bg-[#c59433] hover:text-white font-medium text-xs px-3 h-8 shadow-md"
              onClick={() => setShowModal(true)}
            >
              <Download className="h-3.5 w-3.5 mr-1" /> Get App
            </Button>
            <button onClick={handleDismiss} className="text-white/80 hover:text-white p-1">
              <X className="h-4 w-4" />
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
        variant="outline"
        className="border-white/30 bg-white/10 text-white hover:bg-white/20 font-medium text-xs backdrop-blur-sm"
        data-testid="header-install-btn"
      >
        <Download className="h-3.5 w-3.5 mr-1" />
        <span className="hidden sm:inline">Get App</span>
      </Button>
      <InstallModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};

// Floating Install Button - Not a fixed element anymore, will be placed by parent
export const FloatingInstallButton = () => {
  const [showModal, setShowModal] = useState(false);
  const { isStandalone } = getDeviceInfo();

  if (isStandalone) return null;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-[#b2101f] hover:bg-[#8a0c18] text-white p-3 rounded-full shadow-xl transition-all hover:scale-110"
        data-testid="floating-install-btn"
      >
        <Download className="h-5 w-5" />
      </button>
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
      <div className="bg-gradient-to-r from-[#b2101f]/10 to-[#e70825]/10 border-t border-[#c59433]/20 py-6 px-4" data-testid="footer-install-section">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Smartphone className="h-6 w-6 text-[#b2101f]" />
            <h3 className="text-lg font-semibold text-gray-800">Download Al Taj App</h3>
          </div>
          <p className="text-gray-500 text-sm mb-4 max-w-md mx-auto">
            Order faster with our mobile app
          </p>
          <Button 
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-[#b2101f] to-[#e70825] hover:from-[#8a0c18] hover:to-[#b2101f] text-white font-medium px-6 shadow-lg"
          >
            <Download className="h-4 w-4 mr-2" />
            Download App
          </Button>
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
