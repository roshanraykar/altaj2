import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, CreditCard, Banknote, AlertCircle } from 'lucide-react';

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
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    delivery_address: '',
    special_instructions: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  if (!cart || cart.length === 0) {
    navigate('/order');
    return null;
  }

  const subtotal = cart.reduce((sum, item) => sum + item.total_price, 0);
  const gst = subtotal * 0.05;
  const total = subtotal + gst;

  // Validation Functions
  const validatePhone = (phone) => {
    // Indian phone: +91-XXXXXXXXXX or 91XXXXXXXXXX or 10 digits
    const cleanPhone = phone.replace(/[\s-]/g, '');
    const indianPhoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
    return indianPhoneRegex.test(cleanPhone);
  };

  const validateEmail = (email) => {
    if (!email) return true; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!customerInfo.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (customerInfo.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    // Phone validation
    if (!customerInfo.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(customerInfo.phone)) {
      newErrors.phone = 'Invalid Indian phone number (e.g., +91-9876543210)';
    }

    // Email validation
    if (customerInfo.email && !validateEmail(customerInfo.email)) {
      newErrors.email = 'Invalid email address';
    }

    // Delivery address validation
    if (orderType === 'delivery') {
      if (!customerInfo.delivery_address.trim()) {
        newErrors.delivery_address = 'Delivery address is required';
      } else if (customerInfo.delivery_address.trim().length < 10) {
        newErrors.delivery_address = 'Please enter complete address (minimum 10 characters)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatPhoneNumber = (phone) => {
    const cleaned = phone.replace(/[\s-]/g, '');
    if (cleaned.startsWith('+91')) {
      return cleaned;
    } else if (cleaned.startsWith('91')) {
      return '+' + cleaned;
    } else if (cleaned.length === 10) {
      return '+91' + cleaned;
    }
    return '+91' + cleaned;
  };

  const handleRazorpayPayment = async (orderId, amount) => {
    try {
      // Create Razorpay order
      const paymentOrderResponse = await axios.post(`${API}/payment/create-order`, {
        amount: Math.round(amount * 100), // Convert to paise
        currency: 'INR',
        order_id: orderId
      });

      const options = {
        key: paymentOrderResponse.data.key_id,
        amount: paymentOrderResponse.data.amount,
        currency: paymentOrderResponse.data.currency,
        name: 'Al Taj Restaurant',
        description: `Order #${orderId}`,
        order_id: paymentOrderResponse.data.razorpay_order_id,
        handler: async (response) => {
          try {
            // Verify payment
            await axios.post(`${API}/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: orderId
            });

            toast({ 
              title: 'Payment successful!', 
              description: `Order confirmed - #${orderId}` 
            });
            navigate('/order-tracking', { state: { orderId } });
          } catch (error) {
            toast({ 
              title: 'Payment verification failed', 
              description: 'Please contact support', 
              variant: 'destructive' 
            });
          }
        },
        prefill: {
          name: customerInfo.name,
          email: customerInfo.email,
          contact: formatPhoneNumber(customerInfo.phone)
        },
        theme: {
          color: '#059669'
        }
      };

      const razorpayInstance = new Razorpay(options);
      razorpayInstance.on('payment.failed', function (response) {
        toast({ 
          title: 'Payment failed', 
          description: response.error.description, 
          variant: 'destructive' 
        });
      });
      razorpayInstance.open();
    } catch (error) {
      toast({ 
        title: 'Payment initialization failed', 
        description: error.response?.data?.detail || 'Please try again', 
        variant: 'destructive' 
      });
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({ 
        title: 'Validation Error', 
        description: 'Please fix the errors and try again', 
        variant: 'destructive' 
      });
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        customer_name: customerInfo.name.trim(),
        customer_phone: formatPhoneNumber(customerInfo.phone),
        customer_email: customerInfo.email.trim() || null,
        branch_id: selectedBranch.id,
        order_type: orderType,
        items: cart,
        delivery_address: orderType === 'delivery' ? customerInfo.delivery_address.trim() : null,
        special_instructions: customerInfo.special_instructions.trim() || null
      };

      const response = await axios.post(`${API}/orders`, orderData);
      const order = response.data;

      if (paymentMethod === 'online') {
        // Initiate online payment
        handleRazorpayPayment(order.id, order.total);
      } else {
        // COD - direct to tracking
        toast({ 
          title: 'Order placed successfully!', 
          description: `Order #${order.order_number} - Pay on delivery` 
        });
        navigate('/order-tracking', { state: { orderId: order.id } });
      }
    } catch (error) {
      toast({ 
        title: 'Order failed', 
        description: error.response?.data?.detail || 'Please try again', 
        variant: 'destructive' 
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="checkout-page">
      <div className="container mx-auto px-4 max-w-6xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/order')} 
          className="mb-4" 
          data-testid="back-button"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Menu
        </Button>

        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Information Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card data-testid="customer-info-card">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>We'll use this to confirm your order</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePlaceOrder} className="space-y-4" data-testid="checkout-form">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={customerInfo.name}
                      onChange={(e) => {
                        setCustomerInfo({ ...customerInfo, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: '' });
                      }}
                      className={errors.name ? 'border-red-500' : ''}
                      placeholder="Rajesh Kumar"
                      data-testid="customer-name-input"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => {
                        setCustomerInfo({ ...customerInfo, phone: e.target.value });
                        if (errors.phone) setErrors({ ...errors, phone: '' });
                      }}
                      className={errors.phone ? 'border-red-500' : ''}
                      placeholder="+91-9876543210"
                      data-testid="customer-phone-input"
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.phone}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Enter 10-digit mobile number</p>
                  </div>

                  <div>
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => {
                        setCustomerInfo({ ...customerInfo, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      className={errors.email ? 'border-red-500' : ''}
                      placeholder="your.email@example.com"
                      data-testid="customer-email-input"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.email}
                      </p>
                    )}
                  </div>

                  {orderType === 'delivery' && (
                    <div>
                      <Label htmlFor="address">Delivery Address *</Label>
                      <Textarea
                        id="address"
                        value={customerInfo.delivery_address}
                        onChange={(e) => {
                          setCustomerInfo({ ...customerInfo, delivery_address: e.target.value });
                          if (errors.delivery_address) setErrors({ ...errors, delivery_address: '' });
                        }}
                        className={errors.delivery_address ? 'border-red-500' : ''}
                        placeholder="House/Flat No, Street, Landmark, Area, City, Pincode"
                        rows={3}
                        data-testid="delivery-address-input"
                      />
                      {errors.delivery_address && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {errors.delivery_address}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <Label htmlFor="instructions">Special Instructions (Optional)</Label>
                    <Textarea
                      id="instructions"
                      value={customerInfo.special_instructions}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, special_instructions: e.target.value })}
                      placeholder="Extra spicy, no onions, etc."
                      rows={2}
                      data-testid="special-instructions-input"
                    />
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <Card data-testid="payment-method-card">
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Choose how you want to pay</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setPaymentMethod('cod')}>
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex items-center gap-3 cursor-pointer flex-1">
                      <Banknote className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-sm text-gray-500">Pay when you receive your order</p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setPaymentMethod('online')}>
                    <RadioGroupItem value="online" id="online" />
                    <Label htmlFor="online" className="flex items-center gap-3 cursor-pointer flex-1">
                      <CreditCard className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium">Pay Online</p>
                        <p className="text-sm text-gray-500">Card, UPI, Net Banking, Wallets</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            <Card data-testid="order-summary-card">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Branch:</span>
                    <span className="font-medium text-right">{selectedBranch.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Order Type:</span>
                    <span className="font-medium capitalize">{orderType.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-medium">{cart.length} items</span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  {cart.map(item => (
                    <div key={item.menu_item_id} className="flex justify-between text-sm" data-testid={`summary-item-${item.menu_item_id}`}>
                      <div className="flex-1">
                        <p className="font-medium">{item.menu_item_name}</p>
                        <p className="text-gray-600 text-xs">Qty: {item.quantity} × ₹{item.unit_price.toFixed(0)}</p>
                      </div>
                      <span className="font-medium">₹{item.total_price.toFixed(0)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t mt-4 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">₹{subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">GST (5%):</span>
                    <span className="font-medium">₹{gst.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-emerald-700" data-testid="total-amount">₹{total.toFixed(0)}</span>
                  </div>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  className="w-full mt-6 h-12 bg-emerald-700 hover:bg-emerald-800 text-white"
                  disabled={loading}
                  data-testid="place-order-button"
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                  ) : (
                    <>{paymentMethod === 'online' ? 'Proceed to Payment' : 'Place Order'}</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;