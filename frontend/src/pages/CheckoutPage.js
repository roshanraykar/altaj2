import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cart, selectedBranch, orderType } = location.state || {};

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    delivery_address: '',
    special_instructions: ''
  });
  const [loading, setLoading] = useState(false);

  if (!cart || cart.length === 0) {
    navigate('/');
    return null;
  }

  const subtotal = cart.reduce((sum, item) => sum + item.total_price, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        customer_email: customerInfo.email || null,
        branch_id: selectedBranch.id,
        order_type: orderType,
        items: cart,
        delivery_address: orderType === 'delivery' ? customerInfo.delivery_address : null,
        special_instructions: customerInfo.special_instructions || null
      };

      const response = await axios.post(`${API}/orders`, orderData);
      const order = response.data;

      toast({ title: 'Order placed successfully!', description: `Order #${order.order_number}` });
      navigate('/order-tracking', { state: { orderId: order.id } });
    } catch (error) {
      toast({ title: 'Order failed', description: error.response?.data?.detail || 'Please try again', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="checkout-page">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4" data-testid="back-button">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Menu
        </Button>

        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Information Form */}
          <Card data-testid="customer-info-card">
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
              <CardDescription>Please provide your contact details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePlaceOrder} className="space-y-4" data-testid="checkout-form">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    required
                    data-testid="customer-name-input"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    required
                    data-testid="customer-phone-input"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    data-testid="customer-email-input"
                  />
                </div>
                {orderType === 'delivery' && (
                  <div>
                    <Label htmlFor="address">Delivery Address *</Label>
                    <Textarea
                      id="address"
                      value={customerInfo.delivery_address}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, delivery_address: e.target.value })}
                      required={orderType === 'delivery'}
                      placeholder="Enter your full delivery address"
                      data-testid="delivery-address-input"
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="instructions">Special Instructions (Optional)</Label>
                  <Textarea
                    id="instructions"
                    value={customerInfo.special_instructions}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, special_instructions: e.target.value })}
                    placeholder="Any special requests?"
                    data-testid="special-instructions-input"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  disabled={loading}
                  data-testid="place-order-button"
                >
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Placing Order...</> : 'Place Order'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card data-testid="order-summary-card">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Branch:</span>
                    <span>{selectedBranch.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Order Type:</span>
                    <span className="capitalize">{orderType.replace('_', ' ')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="cart-items-card">
              <CardHeader>
                <CardTitle>Items ({cart.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.menu_item_id} className="flex justify-between text-sm" data-testid={`summary-item-${item.menu_item_id}`}>
                      <div>
                        <p className="font-medium">{item.menu_item_name}</p>
                        <p className="text-gray-600">Qty: {item.quantity} × AED {item.unit_price.toFixed(2)}</p>
                      </div>
                      <span className="font-medium">AED {item.total_price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-4 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>AED {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax (5%):</span>
                    <span>AED {tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-orange-600" data-testid="total-amount">AED {total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;