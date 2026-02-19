import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ShoppingCart, MapPin, Phone, Leaf, Store, Package, Truck, X, Plus, Minus, Search, ArrowLeft, Navigation, Loader2, ArrowUp, MessageCircle, Clock, Beef, FlameKindling } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { InstallBanner, HeaderInstallButton, FooterInstallSection } from '@/components/PWAInstallPrompt';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const GOOGLE_MAPS_API_KEY = 'AIzaSyAHZ50WSteOfJNHAE6eCn5Bf8Py1vGQAmE';

const LandingPage = () => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('delivery');
  const [showCart, setShowCart] = useState(false);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [deliveryAvailable, setDeliveryAvailable] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [branchDistances, setBranchDistances] = useState({});
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [openCategories, setOpenCategories] = useState({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const whatsappLink = "https://wa.me/918123884771?text=Hi%2C%20I%20want%20to%20order%20food%20at%20Al%20Taj%20Restaurant%20and%20I%20need%20help";

  // Handle scroll for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToCategory = (categoryId) => {
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      const offset = 200; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
      setActiveCategory(categoryId);
      // Open the accordion for this category
      setOpenCategories(prev => ({ ...prev, [categoryId]: true }));
    }
  };

  const toggleCategory = (categoryId) => {
    setOpenCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  // Helper to check if category is special (Raw Meat, Ready to Cook, or Combos)
  const isSpecialCategory = (categoryName) => {
    const special = ['raw meat', 'ready to cook', 'combos', 'combo'];
    return special.some(s => categoryName.toLowerCase().includes(s));
  };

  const getCategoryStyle = (categoryName) => {
    const name = categoryName.toLowerCase();
    if (name.includes('raw meat')) {
      return {
        bg: 'bg-gradient-to-r from-red-50 to-orange-50',
        border: 'border-red-200 hover:border-red-400',
        icon: <Beef className="h-5 w-5 text-red-600" />,
        badge: 'bg-red-600',
        accent: 'text-red-600'
      };
    }
    if (name.includes('ready to cook')) {
      return {
        bg: 'bg-gradient-to-r from-amber-50 to-yellow-50',
        border: 'border-amber-200 hover:border-amber-400',
        icon: <FlameKindling className="h-5 w-5 text-amber-600" />,
        badge: 'bg-amber-600',
        accent: 'text-amber-600'
      };
    }
    if (name.includes('combo')) {
      return {
        bg: 'bg-gradient-to-r from-purple-50 to-pink-50',
        border: 'border-purple-200 hover:border-purple-400',
        icon: <Sparkles className="h-5 w-5 text-purple-600" />,
        badge: 'bg-purple-600',
        accent: 'text-purple-600'
      };
    }
    return null;
  };

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  // Get user's current location
  const detectLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          // Calculate distances to all branches
          if (branches.length > 0) {
            const distances = {};
            let nearestBranch = null;
            let minDistance = Infinity;
            
            branches.forEach(branch => {
              const dist = calculateDistance(latitude, longitude, branch.latitude, branch.longitude);
              distances[branch.id] = dist.toFixed(1);
              if (dist < minDistance) {
                minDistance = dist;
                nearestBranch = branch;
              }
            });
            
            setBranchDistances(distances);
            if (nearestBranch) {
              setSelectedBranch(nearestBranch);
              toast({
                title: '📍 Location detected!',
                description: `Nearest branch: ${nearestBranch.name} (${distances[nearestBranch.id]} km away)`
              });
            }
          }
          setLocationLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast({
            title: 'Location access denied',
            description: 'Please select a branch manually',
            variant: 'destructive'
          });
          setLocationLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      toast({
        title: 'Location not supported',
        description: 'Your browser does not support geolocation',
        variant: 'destructive'
      });
      setLocationLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchCategories();
  }, []);

  // Auto-detect location when branches are loaded
  useEffect(() => {
    if (branches.length > 0 && !userLocation) {
      detectLocation();
    }
  }, [branches]);

  useEffect(() => {
    if (selectedBranch) {
      fetchMenuItems(selectedBranch.id);
      fetchTables(selectedBranch.id);
      checkDeliveryAvailability(selectedBranch.id);
    }
  }, [selectedBranch]);

  const fetchBranches = async () => {
    try {
      const response = await axios.get(`${API}/branches?is_active=true`);
      setBranches(response.data);
      if (response.data.length > 0) {
        setSelectedBranch(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/menu/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchMenuItems = async (branchId) => {
    try {
      const response = await axios.get(`${API}/menu/items?branch_id=${branchId}`);
      setMenuItems(response.data);
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
    }
  };

  const fetchTables = async (branchId) => {
    try {
      const response = await axios.get(`${API}/tables?branch_id=${branchId}`);
      setTables(response.data);
    } catch (error) {
      console.error('Failed to fetch tables:', error);
    }
  };

  const checkDeliveryAvailability = async (branchId) => {
    try {
      const response = await axios.get(`${API}/delivery-partners/availability/${branchId}`);
      setDeliveryAvailable(response.data.available);
    } catch (error) {
      console.error('Failed to check delivery availability:', error);
      setDeliveryAvailable(false);
    }
  };

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.menu_item_id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.menu_item_id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1, total_price: (cartItem.quantity + 1) * cartItem.unit_price }
          : cartItem
      ));
    } else {
      setCart([...cart, {
        menu_item_id: item.id,
        menu_item_name: item.name,
        quantity: 1,
        unit_price: item.base_price,
        total_price: item.base_price
      }]);
    }
    toast({ title: 'Added to cart', description: `${item.name} added successfully` });
  };

  const updateQuantity = (itemId, change) => {
    setCart(cart.map(item => {
      if (item.menu_item_id === itemId) {
        const newQuantity = Math.max(0, item.quantity + change);
        return { ...item, quantity: newQuantity, total_price: newQuantity * item.unit_price };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.menu_item_id !== itemId));
    toast({ title: 'Removed from cart' });
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.total_price, 0).toFixed(2);
  };

  const getCartCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({ title: 'Cart is empty', description: 'Please add items to cart first', variant: 'destructive' });
      return;
    }
    if (orderType === 'dine_in' && !selectedTable) {
      toast({ title: 'Select a table', description: 'Please select a table for dine-in orders', variant: 'destructive' });
      return;
    }
    if (orderType === 'delivery' && !deliveryAvailable) {
      toast({ title: 'Delivery unavailable', description: 'All delivery partners are busy. Try takeaway instead.', variant: 'destructive' });
      return;
    }
    navigate('/checkout', { state: { cart, selectedBranch, orderType, selectedTable } });
  };

  const handleOrderTypeChange = (type) => {
    setOrderType(type);
    if (type !== 'dine_in') {
      setSelectedTable(null);
    }
  };

  const getAvailableTables = () => {
    return tables.filter(table => {
      const status = table.status || (table.is_occupied ? 'occupied' : 'vacant');
      return status === 'vacant';
    });
  };

  const getItemsByCategory = (categoryId) => {
    let items = menuItems.filter(item => item.category_id === categoryId);
    
    // Apply search filter if query exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      items = items.filter(item => 
        item.name.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query))
      );
    }
    
    return items;
  };

  // Get all filtered items for search results display
  const getFilteredItems = () => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase().trim();
    return menuItems.filter(item => 
      item.name.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query))
    );
  };

  const orderTypeIcons = {
    takeaway: <Package className="h-5 w-5" />,
    delivery: <Truck className="h-5 w-5" />
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fef7e7] via-white to-[#fff5f5]">
      {/* Install Banner at Top */}
      <InstallBanner />
      
      {/* Premium Header with Brand Colors */}
      <header className="bg-gradient-to-r from-[#b2101f] via-[#e70825] to-[#b2101f] text-white shadow-2xl sticky top-0 z-50 border-b-4 border-[#c59433]" data-testid="landing-header">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="icon"
                className="text-white hover:bg-white/20 rounded-full"
                onClick={() => navigate('/')}
                data-testid="back-to-home-button"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <img src="/altaj-logo.png" alt="Al Taj Restaurant" className="h-12 w-auto" />
              <div className="hidden sm:block">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight" data-testid="restaurant-name">Al Taj Restaurant</h1>
                <p className="text-white/80 text-xs flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  Authentic Flavors • Hubballi
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-3">
              <HeaderInstallButton />
              <Button 
                variant="outline" 
                className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hidden md:flex text-sm" 
                onClick={() => navigate('/login')} 
                data-testid="login-button"
              >
                Sign In
              </Button>
              <Button 
                className="bg-white text-[#b2101f] hover:bg-[#c59433] hover:text-white font-semibold relative shadow-lg" 
                onClick={() => setShowCart(!showCart)} 
                data-testid="cart-button"
              >
                <ShoppingCart className="mr-1 md:mr-2 h-5 w-5" />
                <span className="hidden md:inline">Cart</span>
                {getCartCount() > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-[#c59433] text-white border-2 border-white">
                    {getCartCount()}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Branch Selection - Premium Design */}
        <Card className="mb-8 border-2 border-red-200 shadow-xl bg-white/80 backdrop-blur-sm" data-testid="branch-selection-card">
          <CardHeader className="border-b border-red-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Store className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Choose Your Branch</CardTitle>
                  <CardDescription>Select the nearest Al Taj location</CardDescription>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="border-red-300 text-red-600 hover:bg-red-50"
                onClick={detectLocation}
                disabled={locationLoading}
                data-testid="detect-location-btn"
              >
                {locationLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4 mr-2" />
                )}
                {locationLoading ? 'Detecting...' : 'Detect Location'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {branches.map(branch => (
                <Card
                  key={branch.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-2xl border-2 ${
                    selectedBranch?.id === branch.id 
                      ? 'ring-4 ring-red-500 bg-gradient-to-br from-red-50 to-red-50 border-red-500 shadow-xl' 
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                  onClick={() => setSelectedBranch(branch)}
                  data-testid={`branch-card-${branch.id}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-lg text-gray-800">{branch.name}</h3>
                      <div className="flex items-center gap-2">
                        {branchDistances[branch.id] && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                            {branchDistances[branch.id]} km
                          </Badge>
                        )}
                        {selectedBranch?.id === branch.id && (
                          <Badge className="bg-green-500">Selected</Badge>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3 text-sm text-gray-600">
                      <p className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-1 flex-shrink-0 text-red-600" />
                        <span>{branch.address}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-red-600" />
                        <span className="font-medium">{branch.phone}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-red-600" />
                        <span className="text-green-600 font-semibold">Open Now</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order Type Selection - Enhanced */}
        <Card className="mb-8 border-2 border-red-200 shadow-xl bg-white/80 backdrop-blur-sm" data-testid="order-type-card">
          <CardContent className="pt-6">
            <Tabs value={orderType} onValueChange={handleOrderTypeChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-14 bg-gradient-to-r from-red-100 to-red-100">
                <TabsTrigger 
                  value="takeaway" 
                  className="data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-lg font-semibold flex items-center gap-2" 
                  data-testid="order-type-takeaway"
                >
                  {orderTypeIcons.takeaway}
                  Takeaway
                </TabsTrigger>
                <TabsTrigger 
                  value="delivery" 
                  className={`data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-lg font-semibold flex items-center gap-2 ${!deliveryAvailable ? 'opacity-50' : ''}`}
                  data-testid="order-type-delivery"
                  disabled={!deliveryAvailable}
                >
                  {orderTypeIcons.delivery}
                  Delivery
                  {!deliveryAvailable && <span className="text-xs text-red-500 ml-1">(Unavailable)</span>}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Delivery unavailable notice */}
            {orderType === 'delivery' && !deliveryAvailable && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">
                  ⚠️ Delivery is currently unavailable. All delivery partners are busy. Please try again later or choose takeaway.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Menu - World-Class Design */}
        <div className="mb-8">
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Our Menu</h2>
                <p className="text-gray-600">Authentic Indian & Chinese cuisine prepared with love</p>
              </div>
              {/* Search Bar */}
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 py-3 text-lg border-2 border-gray-200 focus:border-[#b2101f] rounded-xl shadow-sm"
                  data-testid="menu-search-input"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Category Navigation - Compact Grid */}
          <div className="sticky top-[70px] z-40 bg-white/95 backdrop-blur-md py-3 mb-6 border-b border-[#c59433]/20 shadow-sm -mx-4 px-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map(category => {
                const style = getCategoryStyle(category.name);
                return (
                  <button
                    key={category.id}
                    onClick={() => scrollToCategory(category.id)}
                    className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                      activeCategory === category.id
                        ? 'bg-gradient-to-r from-[#b2101f] to-[#e70825] text-white shadow-lg scale-105'
                        : style 
                          ? `${style.bg} ${style.accent} ${style.border} border`
                          : 'bg-gray-100 text-gray-700 hover:bg-[#c59433]/20 hover:text-[#b2101f]'
                    }`}
                    data-testid={`category-nav-${category.id}`}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Results Display */}
          {searchQuery.trim() && (
            <div className="mb-6 p-4 bg-[#b2101f]/10 rounded-xl border border-[#b2101f]/20">
              <p className="text-[#b2101f] font-medium">
                <Search className="h-4 w-4 inline mr-2" />
                Found {getFilteredItems().length} items matching "{searchQuery}"
              </p>
            </div>
          )}
          
          {categories.map(category => {
            const categoryItems = getItemsByCategory(category.id);
            if (categoryItems.length === 0) return null;

            return (
              <div key={category.id} id={`category-${category.id}`} className="mb-12 scroll-mt-48" data-testid={`menu-category-${category.id}`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-1 w-12 bg-gradient-to-r from-red-500 to-red-500 rounded"></div>
                  <h3 className="text-3xl font-bold text-gray-800">
                    {category.name}
                  </h3>
                  {searchQuery.trim() && (
                    <Badge className="bg-red-100 text-red-700 ml-2">
                      {categoryItems.length} match{categoryItems.length !== 1 ? 'es' : ''}
                    </Badge>
                  )}
                  <div className="h-1 flex-1 bg-gradient-to-r from-red-500 to-transparent rounded"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryItems.map(item => (
                    <Card 
                      key={item.id} 
                      className="group hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-red-300 bg-white overflow-hidden" 
                      data-testid={`menu-item-${item.id}`}
                    >
                      {/* Food Image */}
                      {item.image_url && (
                        <div className="h-40 overflow-hidden">
                          <img 
                            src={item.image_url} 
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>
                      )}
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-lg text-gray-800 group-hover:text-red-600 transition-colors">{item.name}</h4>
                          {item.is_vegetarian && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 font-semibold">
                              <Leaf className="h-3 w-3 mr-1" />Veg
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                          <span className="text-xl font-bold text-red-600 flex items-center">
                            ₹{item.base_price.toFixed(0)}
                          </span>
                          <Button
                            onClick={() => addToCart(item)}
                            className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-700 text-white font-semibold shadow-lg"
                            data-testid={`add-to-cart-${item.id}`}
                          >
                            <Plus className="mr-1 h-4 w-4" />
                            Add
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Premium Floating Cart */}
      {showCart && cart.length > 0 && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4" onClick={() => setShowCart(false)}>
          <Card 
            className="w-full md:max-w-lg max-h-[90vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300" 
            onClick={(e) => e.stopPropagation()}
            data-testid="cart-summary"
          >
            <CardHeader className="border-b bg-gradient-to-r from-red-600 to-red-500 text-white">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl">Your Order</CardTitle>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setShowCart(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <CardDescription className="text-red-100">Review items before checkout</CardDescription>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-96 pt-6">
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.menu_item_id} className="flex gap-4 p-4 bg-gray-50 rounded-lg" data-testid={`cart-item-${item.menu_item_id}`}>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{item.menu_item_name}</p>
                      <p className="text-sm text-gray-600">₹{item.unit_price.toFixed(0)} each</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-white rounded-lg shadow p-1">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 hover:bg-red-100" 
                          onClick={() => updateQuantity(item.menu_item_id, -1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-bold w-8 text-center">{item.quantity}</span>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 hover:bg-red-100" 
                          onClick={() => updateQuantity(item.menu_item_id, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <p className="font-bold text-red-600">₹{item.total_price.toFixed(0)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <div className="border-t p-6 bg-gray-50">
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">₹{getCartTotal()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST (5%)</span>
                  <span className="font-semibold">₹{(parseFloat(getCartTotal()) * 0.05).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-3 border-t">
                  <span>Total</span>
                  <span className="text-red-600">₹{(parseFloat(getCartTotal()) * 1.05).toFixed(0)}</span>
                </div>
              </div>
              <Button 
                onClick={handleCheckout} 
                className="w-full h-14 text-lg bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-700 font-bold shadow-xl" 
                data-testid="checkout-button"
              >
                Proceed to Checkout
              </Button>
            </div>
          </Card>
        </div>
      )}
      
      {/* Footer Install Section */}
      <FooterInstallSection />

      {/* Floating Buttons Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {/* Back to Top Button */}
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            className="bg-[#b2101f] hover:bg-[#8a0c18] text-white p-3 rounded-full shadow-xl transition-all hover:scale-110"
            data-testid="back-to-top-btn"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        )}
        
        {/* Get App Button */}
        <FloatingInstallButton />
      </div>

      {/* WhatsApp Floating Button */}
      <a 
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 flex items-center gap-2 group"
        data-testid="whatsapp-btn"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="hidden group-hover:inline-block text-sm font-medium whitespace-nowrap pr-2">Need help? Chat now</span>
      </a>
    </div>
  );
};

export default LandingPage;