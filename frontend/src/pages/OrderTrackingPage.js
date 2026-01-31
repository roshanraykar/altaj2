import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, ChefHat, Truck, Package, Home } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const OrderTrackingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId } = location.state || {};
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      navigate('/');
      return;
    }
    fetchOrder();
    const interval = setInterval(fetchOrder, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`${API}/orders/${orderId}`);
      setOrder(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch order:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!order) {
    return <div className="min-h-screen flex items-center justify-center">Order not found</div>;
  }

  const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: Clock },
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
    { key: 'preparing', label: 'Preparing', icon: ChefHat },
    { key: 'ready', label: 'Ready', icon: Package },
  ];

  if (order.order_type === 'delivery') {
    statusSteps.push(
      { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
      { key: 'completed', label: 'Delivered', icon: CheckCircle2 }
    );
  } else {
    statusSteps.push({ key: 'completed', label: 'Completed', icon: CheckCircle2 });
  }

  const currentStepIndex = statusSteps.findIndex(step => step.key === order.status);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500',
      confirmed: 'bg-blue-500',
      preparing: 'bg-purple-500',
      ready: 'bg-green-500',
      out_for_delivery: 'bg-indigo-500',
      completed: 'bg-green-600',
      cancelled: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="order-tracking-page">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4" data-testid="back-to-home">
          <Home className="mr-2 h-4 w-4" /> Back to Home
        </Button>

        <Card className="mb-6" data-testid="order-info-card">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl">Order #{order.order_number}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Tracking your order in real-time</p>
              </div>
              <Badge className={getStatusColor(order.status)} data-testid="order-status-badge">
                {order.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Customer:</p>
                <p className="font-medium">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-gray-600">Phone:</p>
                <p className="font-medium">{order.customer_phone}</p>
              </div>
              <div>
                <p className="text-gray-600">Order Type:</p>
                <p className="font-medium capitalize">{order.order_type.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-gray-600">Total Amount:</p>
                <p className="font-bold text-orange-600">₹{order.total.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Status Timeline */}
        <Card data-testid="order-timeline-card">
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <div className="space-y-8">
                {statusSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;

                  return (
                    <div key={step.key} className="relative flex items-center" data-testid={`status-step-${step.key}`}>
                      <div
                        className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 border-white ${
                          isCompleted ? 'bg-orange-600' : 'bg-gray-300'
                        } ${
                          isCurrent ? 'ring-4 ring-orange-200' : ''
                        }`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className={`font-medium ${
                          isCompleted ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {step.label}
                        </p>
                        {isCurrent && (
                          <p className="text-sm text-orange-600 font-medium">Current Status</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="mt-6" data-testid="order-items-card">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-0" data-testid={`order-item-${index}`}>
                  <div>
                    <p className="font-medium">{item.menu_item_name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity} × ₹{item.unit_price.toFixed(2)}</p>
                  </div>
                  <span className="font-medium">₹{item.total_price.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>₹{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>GST:</span>
                <span>₹{order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-orange-600">₹{order.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderTrackingPage;