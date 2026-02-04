import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ShoppingCart, MapPin, Phone, Clock, Leaf, Store, Utensils, Package, Truck, X, Plus, Minus, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

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
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchBranches();
    fetchCategories();
  }, []);

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
    return menuItems.filter(item => item.category_id === categoryId);
  };

  const orderTypeIcons = {
    dine_in: <Utensils className="h-5 w-5" />,
    takeaway: <Package className="h-5 w-5" />,
    delivery: <Truck className="h-5 w-5" />
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Premium Header */}
      <header className="bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 text-white shadow-2xl sticky top-0 z-50" data-testid="landing-header">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img src="/altaj-logo.png" alt="Al Taj Restaurant" className="h-14 w-auto" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight" data-testid="restaurant-name">Al Taj Restaurant</h1>
                <p className="text-orange-100 text-sm flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  Authentic Flavors • Hubballi, Karnataka
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hidden md:flex" 
                onClick={() => navigate('/login')} 
                data-testid="login-button"
              >
                Sign In
              </Button>
              <Button 
                className="bg-white text-orange-600 hover:bg-orange-50 font-semibold relative" 
                onClick={() => setShowCart(!showCart)} 
                data-testid="cart-button"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                <span className="hidden md:inline">Cart</span>
                {getCartCount() > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white border-2 border-white">
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
        <Card className="mb-8 border-2 border-orange-200 shadow-xl bg-white/80 backdrop-blur-sm" data-testid="branch-selection-card">
          <CardHeader className="border-b border-orange-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Store className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">Choose Your Branch</CardTitle>
                <CardDescription>Select the nearest Al Taj location</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {branches.map(branch => (
                <Card
                  key={branch.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-2xl border-2 ${
                    selectedBranch?.id === branch.id 
                      ? 'ring-4 ring-orange-500 bg-gradient-to-br from-orange-50 to-red-50 border-orange-500 shadow-xl' 
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                  onClick={() => setSelectedBranch(branch)}
                  data-testid={`branch-card-${branch.id}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-lg text-gray-800">{branch.name}</h3>
                      {selectedBranch?.id === branch.id && (
                        <Badge className="bg-green-500">Selected</Badge>
                      )}
                    </div>
                    <div className="space-y-3 text-sm text-gray-600">
                      <p className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-1 flex-shrink-0 text-orange-600" />
                        <span>{branch.address}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-orange-600" />
                        <span className="font-medium">{branch.phone}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-600" />
                        <span className="text-green-600 font-semibold">Open Now • 24 Hours</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order Type Selection - Enhanced */}
        <Card className="mb-8 border-2 border-orange-200 shadow-xl bg-white/80 backdrop-blur-sm" data-testid="order-type-card">
          <CardContent className="pt-6">
            <Tabs value={orderType} onValueChange={handleOrderTypeChange} className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-14 bg-gradient-to-r from-orange-100 to-red-100">
                <TabsTrigger 
                  value="dine_in" 
                  className="data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-lg font-semibold flex items-center gap-2" 
                  data-testid="order-type-dine-in"
                >
                  {orderTypeIcons.dine_in}
                  Dine In
                </TabsTrigger>
                <TabsTrigger 
                  value="takeaway" 
                  className="data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-lg font-semibold flex items-center gap-2" 
                  data-testid="order-type-takeaway"
                >
                  {orderTypeIcons.takeaway}
                  Takeaway
                </TabsTrigger>
                <TabsTrigger 
                  value="delivery" 
                  className={`data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-lg font-semibold flex items-center gap-2 ${!deliveryAvailable ? 'opacity-50' : ''}`}
                  data-testid="order-type-delivery"
                  disabled={!deliveryAvailable}
                >
                  {orderTypeIcons.delivery}
                  Delivery
                  {!deliveryAvailable && <span className="text-xs text-red-500 ml-1">(Unavailable)</span>}
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            {/* Table Selection for Dine-in */}
            {orderType === 'dine_in' && (
              <div className="mt-6" data-testid="table-selection">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Store className="h-5 w-5 text-orange-600" />
                  Select Your Table
                </h4>
                {getAvailableTables().length === 0 ? (
                  <p className="text-gray-500 text-sm">No tables available at the moment. Please try takeaway or delivery.</p>
                ) : (
                  <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                    {getAvailableTables().map(table => (
                      <button
                        key={table.id}
                        onClick={() => setSelectedTable(table)}
                        className={`p-3 rounded-lg border-2 text-center transition-all ${
                          selectedTable?.id === table.id
                            ? 'bg-orange-500 text-white border-orange-500 shadow-lg'
                            : 'bg-white border-gray-200 hover:border-orange-300'
                        }`}
                        data-testid={`table-${table.id}`}
                      >
                        <span className="font-bold text-sm">{table.table_number}</span>
                        <span className="block text-xs opacity-75">{table.capacity}P</span>
                      </button>
                    ))}
                  </div>
                )}
                {selectedTable && (
                  <p className="mt-3 text-sm text-green-600 font-medium">
                    ✓ Table {selectedTable.table_number} selected (Capacity: {selectedTable.capacity})
                  </p>
                )}
              </div>
            )}

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
            <h2 className="text-4xl font-bold text-gray-800 mb-2">Our Menu</h2>
            <p className="text-gray-600">Authentic Indian & Chinese cuisine prepared with love</p>
          </div>
          
          {categories.map(category => {
            const categoryItems = getItemsByCategory(category.id);
            if (categoryItems.length === 0) return null;

            return (
              <div key={category.id} className="mb-12" data-testid={`menu-category-${category.id}`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-1 w-12 bg-gradient-to-r from-orange-500 to-red-500 rounded"></div>
                  <h3 className="text-3xl font-bold text-gray-800">
                    {category.name}
                  </h3>
                  <div className="h-1 flex-1 bg-gradient-to-r from-red-500 to-transparent rounded"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryItems.map(item => (
                    <Card 
                      key={item.id} 
                      className="group hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-orange-300 bg-white overflow-hidden" 
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
                          <h4 className="font-bold text-lg text-gray-800 group-hover:text-orange-600 transition-colors">{item.name}</h4>
                          {item.is_vegetarian && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 font-semibold">
                              <Leaf className="h-3 w-3 mr-1" />Veg
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                          <span className="text-xl font-bold text-orange-600 flex items-center">
                            ₹{item.base_price.toFixed(0)}
                          </span>
                          <Button
                            onClick={() => addToCart(item)}
                            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold shadow-lg"
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
            <CardHeader className="border-b bg-gradient-to-r from-orange-600 to-red-600 text-white">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl">Your Order</CardTitle>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setShowCart(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <CardDescription className="text-orange-100">Review items before checkout</CardDescription>
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
                          className="h-8 w-8 hover:bg-orange-100" 
                          onClick={() => updateQuantity(item.menu_item_id, -1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-bold w-8 text-center">{item.quantity}</span>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 hover:bg-orange-100" 
                          onClick={() => updateQuantity(item.menu_item_id, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <p className="font-bold text-orange-600">₹{item.total_price.toFixed(0)}</p>
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
                  <span className="text-orange-600">₹{(parseFloat(getCartTotal()) * 1.05).toFixed(0)}</span>
                </div>
              </div>
              <Button 
                onClick={handleCheckout} 
                className="w-full h-14 text-lg bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 font-bold shadow-xl" 
                data-testid="checkout-button"
              >
                Proceed to Checkout
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LandingPage;