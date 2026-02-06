import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Clock, MapPin, Star, Phone, Utensils, Package, Truck, Download } from 'lucide-react';
import { InstallBanner, HeaderInstallButton, FooterInstallSection } from '@/components/PWAInstallPrompt';

const NewLandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Utensils className="h-8 w-8" />,
      title: "Dine-In Excellence",
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
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "24/7 Service",
      description: "Open round the clock to serve you anytime"
    }
  ];

  const locations = [
    {
      name: "Old Hubli",
      address: "Vishal Nagar, Gudihal Road",
      phone: "+91-836-2245678"
    },
    {
      name: "Shirur Park",
      address: "JC Nagar, Vidyanagar",
      phone: "+91-836-2356789"
    }
  ];

  return (
    <div className="min-h-screen bg-white" data-testid="landing-page">
      {/* Install Banner - Shows at top */}
      <InstallBanner />
      
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img src="/altaj-logo.png" alt="Al Taj Restaurant" className="h-10 sm:h-12 w-auto object-contain" />
            </div>
            <nav className="hidden md:flex items-center space-x-8 text-sm">
              <button onClick={() => document.getElementById('menu').scrollIntoView({behavior: 'smooth'})} className="text-gray-600 hover:text-gray-900 transition-colors">Menu</button>
              <button onClick={() => document.getElementById('locations').scrollIntoView({behavior: 'smooth'})} className="text-gray-600 hover:text-gray-900 transition-colors">Locations</button>
              <button onClick={() => document.getElementById('about').scrollIntoView({behavior: 'smooth'})} className="text-gray-600 hover:text-gray-900 transition-colors">About</button>
            </nav>
            <div className="flex items-center space-x-3">
              <HeaderInstallButton />
              <Button variant="ghost" onClick={() => navigate('/login')} className="text-sm font-light">Sign In</Button>
              <Button onClick={() => navigate('/order')} className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 text-sm font-light">Order Now</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Elegant & Minimal */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-emerald-700 text-sm font-light tracking-widest uppercase">Authentic Indian Cuisine</p>
                <h1 className="text-5xl md:text-6xl font-light text-gray-900 leading-tight">
                  Taste the
                  <span className="block font-normal">Tradition</span>
                </h1>
                <p className="text-lg text-gray-600 font-light leading-relaxed max-w-md">
                  Experience the rich flavors of North Indian and Chinese cuisine, crafted with passion and served with pride since our establishment.
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button onClick={() => navigate('/order')} size="lg" className="bg-emerald-700 hover:bg-emerald-800 text-white px-8 h-12 text-base font-light">
                  Order Online <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button onClick={() => document.getElementById('locations').scrollIntoView({behavior: 'smooth'})} variant="outline" size="lg" className="h-12 px-8 text-base font-light border-gray-300">
                  Find Us
                </Button>
              </div>
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-amber-100 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-rose-100 border-2 border-white"></div>
                  </div>
                  <span className="text-sm text-gray-600 font-light">10,000+ happy customers</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-red-50 to-amber-50 overflow-hidden flex items-center justify-center p-8">
                <img src="/altaj-logo.png" alt="Al Taj Restaurant" className="w-full h-auto max-w-xs" />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-xl shadow-xl border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                  </div>
                  <span className="text-sm font-light text-gray-700">4.8/5 Rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-emerald-700 text-sm font-light tracking-widest uppercase mb-3">Our Services</p>
            <h2 className="text-4xl font-light text-gray-900">How We <span className="font-normal">Serve</span></h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 bg-white border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                <div className="text-emerald-700 mb-4">{feature.icon}</div>
                <h3 className="text-lg font-normal text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 font-light leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Highlight Section */}
      <section id="menu" className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-emerald-700 text-sm font-light tracking-widest uppercase mb-3">Our Specialties</p>
            <h2 className="text-4xl font-light text-gray-900 mb-4">Signature <span className="font-normal">Dishes</span></h2>
            <p className="text-gray-600 font-light max-w-2xl mx-auto">From aromatic biryanis to rich curries, each dish is a celebration of authentic flavors</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Chicken Biryani", price: "₹170 - ₹320", desc: "Fragrant basmati rice with tender chicken" },
              { name: "Butter Chicken", price: "₹200 - ₹400", desc: "Creamy tomato curry, rich and flavorful" },
              { name: "Tandoori Chicken", price: "₹210 - ₹410", desc: "Tandoor grilled to smoky perfection" }
            ].map((item, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-emerald-50 rounded-xl mb-4 overflow-hidden relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Utensils className="h-24 w-24 text-gray-200 group-hover:text-emerald-200 transition-colors" />
                  </div>
                </div>
                <h3 className="text-lg font-normal text-gray-900 mb-1">{item.name}</h3>
                <p className="text-sm text-gray-600 font-light mb-2">{item.desc}</p>
                <p className="text-emerald-700 font-normal">{item.price}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button onClick={() => navigate('/order')} size="lg" variant="outline" className="border-emerald-700 text-emerald-700 hover:bg-emerald-700 hover:text-white px-8 h-12 text-base font-light">
              View Full Menu <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section id="locations" className="py-20 bg-gray-50 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-emerald-700 text-sm font-light tracking-widest uppercase mb-3">Visit Us</p>
            <h2 className="text-4xl font-light text-gray-900">Our <span className="font-normal">Locations</span></h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {locations.map((location, index) => (
              <Card key={index} className="p-8 bg-white border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="text-xl font-normal text-gray-900 mb-2">{location.name}</h3>
                    <p className="text-gray-600 font-light mb-1">{location.address}</p>
                    <p className="text-sm text-gray-500 font-light">Hubballi, Karnataka 580024</p>
                  </div>
                </div>
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-3 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700 font-light">{location.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-emerald-700 font-light">Open 24/7</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-emerald-700 text-sm font-light tracking-widest uppercase mb-3">Our Story</p>
          <h2 className="text-4xl font-light text-gray-900 mb-6">Crafting Memories <span className="font-normal">Since Day One</span></h2>
          <p className="text-lg text-gray-600 font-light leading-relaxed mb-8">
            At Al Taj Restaurant, we believe food is more than sustenance—it's an experience, a memory, a celebration. 
            Our chefs bring decades of expertise to every dish, using traditional recipes passed down through generations 
            while embracing modern culinary techniques.
          </p>
          <p className="text-gray-600 font-light leading-relaxed">
            Whether you're craving the aromatic spices of authentic biryani, the creamy richness of butter chicken, 
            or the bold flavors of Chinese cuisine, Al Taj is your destination for exceptional dining in Hubballi.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-emerald-700 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-light text-white mb-4">Ready to <span className="font-normal">Order?</span></h2>
          <p className="text-emerald-100 font-light text-lg mb-8">Experience the taste of tradition, delivered fresh to your door</p>
          <Button onClick={() => navigate('/order')} size="lg" className="bg-white text-emerald-700 hover:bg-gray-50 px-10 h-14 text-base font-light">
            Start Your Order <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <img src="/altaj-logo.png" alt="Al Taj" className="h-10 w-auto mb-4" />
              <p className="text-sm font-light">Authentic flavors, served with pride across Hubballi</p>
            </div>
            <div>
              <h4 className="text-white font-normal mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm font-light">
                <p className="hover:text-white cursor-pointer transition-colors">Menu</p>
                <p className="hover:text-white cursor-pointer transition-colors">Locations</p>
                <p className="hover:text-white cursor-pointer transition-colors">About Us</p>
              </div>
            </div>
            <div>
              <h4 className="text-white font-normal mb-4">Contact</h4>
              <div className="space-y-2 text-sm font-light">
                <p>Old Hubli: +91-836-2245678</p>
                <p>Shirur Park: +91-836-2356789</p>
                <p>info@altajrestaurant.com</p>
              </div>
            </div>
            <div>
              <h4 className="text-white font-normal mb-4">Hours</h4>
              <p className="text-emerald-400 text-sm font-light">Open 24/7</p>
              <p className="text-sm font-light mt-2">Serving you round the clock</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm font-light">
            <p>© 2025 Al Taj Restaurant. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Footer Install Section */}
      <FooterInstallSection />
    </div>
  );
};

export default NewLandingPage;