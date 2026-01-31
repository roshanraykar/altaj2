import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, MapPin, Phone, Mail, Clock, ChefHat, Leaf } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LandingPage = () => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('delivery');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchBranches();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      fetchMenuItems(selectedBranch.id);
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

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.total_price, 0).toFixed(2);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({ title: 'Cart is empty', description: 'Please add items to cart first', variant: 'destructive' });
      return;
    }
    navigate('/checkout', { state: { cart, selectedBranch, orderType } });
  };

  const getItemsByCategory = (categoryId) => {
    return menuItems.filter(item => item.category_id === categoryId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg" data-testid="landing-header">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <ChefHat className="h-10 w-10" />
              <div>
                <h1 className="text-3xl font-bold" data-testid="restaurant-name">Al Taj Restaurant</h1>
                <p className="text-orange-100 text-sm">Authentic flavors across Dubai</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="bg-white text-orange-600 hover:bg-orange-50" onClick={() => navigate('/login')} data-testid="login-button">
                Login / Register
              </Button>
              <div className="relative">
                <Button className="bg-orange-700 hover:bg-orange-800" onClick={handleCheckout} data-testid="cart-button">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Cart ({cart.length})
                </Button>
                {cart.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500">AED {getCartTotal()}</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Branch Selection */}
        <Card className="mb-8" data-testid="branch-selection-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-orange-600" />
              Select Your Branch
            </CardTitle>
            <CardDescription>Choose the nearest Al Taj location</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {branches.map(branch => (
                <Card
                  key={branch.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedBranch?.id === branch.id ? 'ring-2 ring-orange-600 bg-orange-50' : ''
                  }`}
                  onClick={() => setSelectedBranch(branch)}
                  data-testid={`branch-card-${branch.id}`}
                >
                  <CardContent className="pt-6">
                    <h3 className="font-bold text-lg mb-2">{branch.name}</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p className="flex items-center"><MapPin className="h-4 w-4 mr-2" />{branch.address}</p>
                      <p className="flex items-center"><Phone className="h-4 w-4 mr-2" />{branch.phone}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order Type Selection */}
        <Card className="mb-8" data-testid="order-type-card">
          <CardContent className="pt-6">
            <Tabs value={orderType} onValueChange={setOrderType} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="dine_in" data-testid="order-type-dine-in">Dine In</TabsTrigger>
                <TabsTrigger value="takeaway" data-testid="order-type-takeaway">Takeaway</TabsTrigger>
                <TabsTrigger value="delivery" data-testid="order-type-delivery">Delivery</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Menu */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Our Menu</h2>
          {categories.map(category => {
            const categoryItems = getItemsByCategory(category.id);
            if (categoryItems.length === 0) return null;

            return (
              <div key={category.id} className="mb-8" data-testid={`menu-category-${category.id}`}>
                <h3 className="text-2xl font-semibold mb-4 text-orange-600 border-b-2 border-orange-200 pb-2">
                  {category.name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryItems.map(item => (
                    <Card key={item.id} className="hover:shadow-lg transition-shadow" data-testid={`menu-item-${item.id}`}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-lg">{item.name}</h4>
                          {item.is_vegetarian && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <Leaf className="h-3 w-3 mr-1" />Veg
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold text-orange-600">AED {item.base_price.toFixed(2)}</span>
                          <Button
                            onClick={() => addToCart(item)}
                            className="bg-orange-600 hover:bg-orange-700"
                            data-testid={`add-to-cart-${item.id}`}
                          >
                            Add to Cart
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

        {/* Cart Summary */}
        {cart.length > 0 && (
          <Card className="fixed bottom-4 right-4 w-96 shadow-2xl" data-testid="cart-summary">
            <CardHeader>
              <CardTitle>Your Order</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {cart.map(item => (
                  <div key={item.menu_item_id} className="flex justify-between items-center" data-testid={`cart-item-${item.menu_item_id}`}>
                    <div className="flex-1">
                      <p className="font-medium">{item.menu_item_name}</p>
                      <p className="text-sm text-gray-600">AED {item.unit_price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={() => updateQuantity(item.menu_item_id, -1)}>-</Button>
                      <span className="font-medium w-8 text-center">{item.quantity}</span>
                      <Button size="sm" variant="outline" onClick={() => updateQuantity(item.menu_item_id, 1)}>+</Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold mb-4">
                  <span>Total:</span>
                  <span className="text-orange-600">AED {getCartTotal()}</span>
                </div>
                <Button onClick={handleCheckout} className="w-full bg-orange-600 hover:bg-orange-700" data-testid="checkout-button">
                  Proceed to Checkout
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LandingPage;