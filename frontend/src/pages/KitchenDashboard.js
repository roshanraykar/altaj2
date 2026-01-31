import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogOut, ChefHat, Clock, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const KitchenDashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders?branch_id=${user.branch_id}`, { headers });
      const activeOrders = response.data.filter(order => 
        !['completed', 'cancelled'].includes(order.status)
      );
      setOrders(activeOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${API}/orders/${orderId}/status`, { status: newStatus }, { headers });
      toast({ title: 'Status updated', description: `Order status changed to ${newStatus}` });
      fetchOrders();
    } catch (error) {
      toast({ title: 'Update failed', description: error.response?.data?.detail || 'Please try again', variant: 'destructive' });
    }
  };

  const getOrderTypeIcon = (orderType) => {
    if (orderType === 'dine_in') return '🍽️';
    if (orderType === 'takeaway') return '📦';
    if (orderType === 'delivery') return '🚗';
    return '📋';
  };

  const groupedOrders = {
    pending: orders.filter(o => o.status === 'pending'),
    confirmed: orders.filter(o => o.status === 'confirmed'),
    preparing: orders.filter(o => o.status === 'preparing'),
    ready: orders.filter(o => ['ready', 'picked_up', 'on_the_way', 'served'].includes(o.status))
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="kitchen-dashboard">
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <ChefHat className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold" data-testid="kitchen-title">Kitchen Dashboard</h1>
                <p className="text-sm text-purple-100">{user?.name}</p>
              </div>
            </div>
            <Button variant="outline" className="bg-white text-purple-600 hover:bg-purple-50" onClick={handleLogout} data-testid="logout-button">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pending Orders */}
          <div data-testid="pending-orders-section">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Clock className="mr-2 h-5 w-5 text-yellow-600" />
              Pending ({groupedOrders.pending.length})
            </h2>
            <div className="space-y-4">
              {groupedOrders.pending.map(order => (
                <Card key={order.id} className="border-yellow-200 bg-yellow-50" data-testid={`pending-order-${order.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">#{order.order_number}</CardTitle>
                        <p className="text-sm text-gray-600">
                          {getOrderTypeIcon(order.order_type)} {order.order_type.replace('_', ' ')}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-yellow-100">New</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm" data-testid={`order-item-${order.id}-${idx}`}>
                          <span>{item.quantity}x {item.menu_item_name}</span>
                        </div>
                      ))}
                    </div>
                    {order.special_instructions && (
                      <p className="text-sm text-orange-600 mb-3 p-2 bg-orange-50 rounded">
                        Note: {order.special_instructions}
                      </p>
                    )}
                    <Button
                      onClick={() => updateOrderStatus(order.id, 'confirmed')}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      data-testid={`confirm-order-${order.id}`}
                    >
                      Confirm Order
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Confirmed Orders */}
          <div data-testid="confirmed-orders-section">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <CheckCircle2 className="mr-2 h-5 w-5 text-blue-600" />
              Confirmed ({groupedOrders.confirmed.length})
            </h2>
            <div className="space-y-4">
              {groupedOrders.confirmed.map(order => (
                <Card key={order.id} className="border-blue-200 bg-blue-50" data-testid={`confirmed-order-${order.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">#{order.order_number}</CardTitle>
                        <p className="text-sm text-gray-600">
                          {getOrderTypeIcon(order.order_type)} {order.order_type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="font-medium">{item.quantity}x {item.menu_item_name}</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      data-testid={`start-preparing-${order.id}`}
                    >
                      Start Preparing
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Preparing Orders */}
          <div data-testid="preparing-orders-section">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <ChefHat className="mr-2 h-5 w-5 text-purple-600" />
              Preparing ({groupedOrders.preparing.length})
            </h2>
            <div className="space-y-4">
              {groupedOrders.preparing.map(order => (
                <Card key={order.id} className="border-purple-200 bg-purple-50" data-testid={`preparing-order-${order.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">#{order.order_number}</CardTitle>
                        <p className="text-sm text-gray-600">
                          {getOrderTypeIcon(order.order_type)} {order.order_type.replace('_', ' ')}
                        </p>
                      </div>
                      <Badge className="bg-purple-600">Cooking</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="font-medium">{item.quantity}x {item.menu_item_name}</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      className="w-full bg-green-600 hover:bg-green-700"
                      data-testid={`mark-ready-${order.id}`}
                    >
                      Mark as Ready
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Ready Orders */}
          <div data-testid="ready-orders-section">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <CheckCircle2 className="mr-2 h-5 w-5 text-green-600" />
              Ready ({groupedOrders.ready.length})
            </h2>
            <div className="space-y-4">
              {groupedOrders.ready.map(order => (
                <Card key={order.id} className="border-green-200 bg-green-50" data-testid={`ready-order-${order.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">#{order.order_number}</CardTitle>
                        <p className="text-sm text-gray-600">
                          {getOrderTypeIcon(order.order_type)} {order.order_type.replace('_', ' ')}
                        </p>
                      </div>
                      <Badge className="bg-green-600">Ready!</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.menu_item_name}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-green-700 font-medium text-center">
                      {order.status === 'out_for_delivery' ? 'Out for Delivery' : 'Ready for Pickup/Serving'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {orders.length === 0 && (
          <Card className="mt-8">
            <CardContent className="pt-6 text-center text-gray-500">
              <ChefHat className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No active orders at the moment</p>
              <p className="text-sm">New orders will appear here automatically</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default KitchenDashboard;