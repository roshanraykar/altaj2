import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, MapPin, Star, Phone, Utensils, Package, Truck, MessageCircle } from 'lucide-react';
import { InstallBanner, HeaderInstallButton, FooterInstallSection } from '@/components/PWAInstallPrompt';

const NewLandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Utensils className="h-8 w-8" />,
      title: "Premium Dining",
      description: "Experience authentic flavors in our elegant ambiance"
    },
    {
      icon: <Package className="h-8 w-8" />,
      title: "Quick Takeaway",
      description: "Fresh food packed with care, ready when you are"
    },
    {
      icon: <Truck className="h-8 w-8" />,
      title: "Fast Delivery",
      description: "Hot meals delivered to your doorstep across Hubballi"
    }
  ];

  const locations = [
    {
      name: "Al Taj - Old Hubli",
      address: "Vishal Nagar, Gudihal Road",
      phone: "+91-836-2245678"
    },
    {
      name: "Al Taj - Shirur Park",
      address: "JC Nagar, Vidyanagar",
      phone: "+91-836-2356789"
    }
  ];

  const whatsappLink = "https://wa.me/918123884771?text=Hi%2C%20I%20want%20to%20order%20food%20at%20Al%20Taj%20Restaurant%20and%20I%20need%20help";

  return (
    <div className="min-h-screen bg-white" data-testid="landing-page">
      {/* Install Banner */}
      <InstallBanner />
      
      {/* Header with premium styling */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-[#c59433]/20 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img src="/altaj-logo.png" alt="Al Taj Restaurant" className="h-12 sm:h-14 w-auto object-contain" />
            </div>
            <nav className="hidden md:flex items-center space-x-8 text-sm">
              <button onClick={() => document.getElementById('menu').scrollIntoView({behavior: 'smooth'})} className="text-gray-700 hover:text-[#b2101f] transition-colors font-medium">Menu</button>
              <button onClick={() => document.getElementById('locations').scrollIntoView({behavior: 'smooth'})} className="text-gray-700 hover:text-[#b2101f] transition-colors font-medium">Locations</button>
              <button onClick={() => document.getElementById('about').scrollIntoView({behavior: 'smooth'})} className="text-gray-700 hover:text-[#b2101f] transition-colors font-medium">About</button>
            </nav>
            <div className="flex items-center space-x-3">
              <HeaderInstallButton />
              <Button variant="ghost" onClick={() => navigate('/login')} className="text-sm font-medium text-gray-700 hover:text-[#b2101f]">Sign In</Button>
              <Button onClick={() => navigate('/order')} className="bg-gradient-to-r from-[#b2101f] to-[#e70825] hover:from-[#8a0c18] hover:to-[#b2101f] text-white px-6 text-sm font-medium shadow-lg shadow-red-200">
                Order Now
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Video Background */}
      <section className="pt-20 relative overflow-hidden min-h-[80vh] flex items-center">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40"></div>
        </div>
        
        <div className="container mx-auto max-w-6xl relative z-10 px-6 py-16">
          <div className="max-w-2xl space-y-8">
            {/* Arabic decorative element */}
            <div className="flex items-center space-x-3">
              <div className="h-[1px] w-12 bg-gradient-to-r from-[#c59433] to-transparent"></div>
              <span className="text-[#c59433] text-sm font-medium tracking-[0.3em] uppercase">Est. Hubballi</span>
              <div className="h-[1px] w-12 bg-gradient-to-l from-[#c59433] to-transparent"></div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-light text-white leading-tight">
                <span className="text-[#c59433] font-serif italic">Taste</span> the
                <span className="block font-semibold text-white">Tradition</span>
              </h1>
              <p className="text-xl text-gray-200 leading-relaxed max-w-lg">
                Experience the rich flavors of North Indian and Chinese cuisine, crafted with passion and served with pride.
              </p>
            </div>
            
            {/* Decorative line */}
            <div className="flex items-center space-x-4">
              <div className="h-[2px] w-16 bg-gradient-to-r from-[#c59433] to-[#b2101f]"></div>
              <div className="h-2 w-2 bg-[#c59433] rotate-45"></div>
              <div className="h-[2px] w-16 bg-gradient-to-l from-[#c59433] to-[#b2101f]"></div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Button onClick={() => navigate('/order')} size="lg" className="bg-gradient-to-r from-[#b2101f] to-[#e70825] hover:from-[#8a0c18] hover:to-[#b2101f] text-white px-8 h-14 text-lg font-semibold shadow-xl border-b-4 border-[#8a0c18]">
                Order Online <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button onClick={() => document.getElementById('locations').scrollIntoView({behavior: 'smooth'})} variant="outline" size="lg" className="h-14 px-8 text-lg font-medium border-2 border-[#c59433] text-[#c59433] hover:bg-[#c59433] hover:text-white bg-black/30 backdrop-blur-sm">
                Find Us
              </Button>
            </div>
            
            <div className="flex items-center space-x-6 pt-4">
              <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full">
                <div className="flex">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 text-[#c59433] fill-current" />)}
                </div>
                <span className="text-sm text-white ml-2">10,000+ happy customers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with premium styling */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative">
        {/* Top border decoration */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#c59433] to-transparent"></div>
        
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-[#c59433]"></div>
              <span className="text-[#c59433] text-sm font-medium tracking-[0.2em] uppercase">Our Services</span>
              <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-[#c59433]"></div>
            </div>
            <h2 className="text-4xl font-light text-gray-900">How We <span className="font-semibold text-[#b2101f]">Serve</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 bg-white border-2 border-gray-100 hover:border-[#c59433]/50 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
                {/* Corner decoration */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#c59433]/10 to-transparent"></div>
                
                <div className="text-[#b2101f] mb-6 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                
                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#b2101f] to-[#c59433] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Highlight Section */}
      <section id="menu" className="py-20 px-6 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-[#c59433]"></div>
              <span className="text-[#c59433] text-sm font-medium tracking-[0.2em] uppercase">Our Specialties</span>
              <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-[#c59433]"></div>
            </div>
            <h2 className="text-4xl font-light text-gray-900 mb-4">Signature <span className="font-semibold text-[#b2101f]">Dishes</span></h2>
            <p className="text-gray-600 max-w-2xl mx-auto">From aromatic biryanis to rich curries, each dish is a celebration of authentic flavors</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Chicken Biryani", price: "₹170 - ₹320", desc: "Fragrant basmati rice with tender chicken" },
              { name: "Butter Chicken", price: "₹200 - ₹400", desc: "Creamy tomato curry, rich and flavorful" },
              { name: "Tandoori Chicken", price: "₹210 - ₹410", desc: "Tandoor grilled to smoky perfection" }
            ].map((item, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="aspect-square bg-gradient-to-br from-[#fef7e7] to-[#fff5f5] rounded-2xl mb-4 overflow-hidden relative border-2 border-gray-100 group-hover:border-[#c59433] transition-all shadow-lg group-hover:shadow-2xl">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Utensils className="h-24 w-24 text-[#c59433]/30 group-hover:text-[#b2101f]/30 transition-colors" />
                  </div>
                  {/* Decorative corner */}
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[#c59433]/30"></div>
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-[#c59433]/30"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{item.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{item.desc}</p>
                <p className="text-[#b2101f] font-bold text-lg">{item.price}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button onClick={() => navigate('/order')} size="lg" className="border-2 border-[#b2101f] bg-transparent text-[#b2101f] hover:bg-[#b2101f] hover:text-white px-10 h-14 text-base font-medium transition-all">
              View Full Menu <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section id="locations" className="py-20 bg-gradient-to-b from-gray-50 to-white px-6 relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#c59433] to-transparent"></div>
        
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-[#c59433]"></div>
              <span className="text-[#c59433] text-sm font-medium tracking-[0.2em] uppercase">Visit Us</span>
              <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-[#c59433]"></div>
            </div>
            <h2 className="text-4xl font-light text-gray-900">Our <span className="font-semibold text-[#b2101f]">Locations</span></h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {locations.map((location, index) => (
              <Card key={index} className="p-8 bg-white border-2 border-gray-100 hover:border-[#c59433]/50 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
                {/* Corner decoration */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#c59433]/10 to-transparent"></div>
                
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#b2101f] to-[#e70825] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <MapPin className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{location.name}</h3>
                    <p className="text-gray-600 mb-1">{location.address}</p>
                    <p className="text-sm text-gray-500">Hubballi, Karnataka 580024</p>
                  </div>
                </div>
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-[#c59433]" />
                    <span className="text-gray-700 font-medium">{location.phone}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 relative">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-[#c59433]"></div>
            <span className="text-[#c59433] text-sm font-medium tracking-[0.2em] uppercase">Our Story</span>
            <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-[#c59433]"></div>
          </div>
          <h2 className="text-4xl font-light text-gray-900 mb-6">Crafting Memories <span className="font-semibold text-[#b2101f]">Since Day One</span></h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-8">
            At Al Taj Restaurant, we believe food is more than sustenance—it's an experience, a memory, a celebration. 
            Our chefs bring decades of expertise to every dish, using traditional recipes passed down through generations.
          </p>
          
          {/* Decorative element */}
          <div className="flex items-center justify-center space-x-4 my-8">
            <div className="h-[2px] w-20 bg-gradient-to-r from-transparent to-[#c59433]"></div>
            <div className="h-3 w-3 bg-[#c59433] rotate-45"></div>
            <div className="h-[2px] w-20 bg-gradient-to-l from-transparent to-[#c59433]"></div>
          </div>
          
          <p className="text-gray-600 leading-relaxed">
            Whether you're craving the aromatic spices of authentic biryani, the creamy richness of butter chicken, 
            or the bold flavors of Chinese cuisine, Al Taj is your destination for exceptional dining in Hubballi.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#b2101f] to-[#e70825] px-6 relative overflow-hidden">
        {/* Arabic pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        
        <div className="container mx-auto max-w-4xl text-center relative">
          <h2 className="text-4xl font-light text-white mb-4">Ready to <span className="font-semibold">Order?</span></h2>
          <p className="text-red-100 text-lg mb-8">Experience the taste of tradition, delivered fresh to your door</p>
          <Button onClick={() => navigate('/order')} size="lg" className="bg-white text-[#b2101f] hover:bg-gray-100 px-12 h-14 text-base font-semibold shadow-2xl border-b-4 border-gray-300">
            Start Your Order <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16 px-6 relative">
        {/* Gold top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#c59433] to-transparent"></div>
        
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <img src="/altaj-logo.png" alt="Al Taj" className="h-12 w-auto mb-4" />
              <p className="text-sm">Authentic flavors, served with pride across Hubballi</p>
            </div>
            <div>
              <h4 className="text-[#c59433] font-semibold mb-4 text-sm tracking-wider uppercase">Quick Links</h4>
              <div className="space-y-2 text-sm">
                <p className="hover:text-white cursor-pointer transition-colors">Menu</p>
                <p className="hover:text-white cursor-pointer transition-colors">Locations</p>
                <p className="hover:text-white cursor-pointer transition-colors">About Us</p>
              </div>
            </div>
            <div>
              <h4 className="text-[#c59433] font-semibold mb-4 text-sm tracking-wider uppercase">Contact</h4>
              <div className="space-y-2 text-sm">
                <p>Old Hubli: +91-836-2245678</p>
                <p>Shirur Park: +91-836-2356789</p>
              </div>
            </div>
            <div>
              <h4 className="text-[#c59433] font-semibold mb-4 text-sm tracking-wider uppercase">Connect</h4>
              <a 
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp Us</span>
              </a>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2025 Al Taj Restaurant. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <a 
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 left-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 flex items-center gap-2 group"
        data-testid="whatsapp-btn"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="hidden group-hover:inline-block text-sm font-medium whitespace-nowrap">Need help? Chat now</span>
      </a>

      {/* Footer Install Section */}
      <FooterInstallSection />
    </div>
  );
};

export default NewLandingPage;
