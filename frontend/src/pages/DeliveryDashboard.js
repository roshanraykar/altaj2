import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { LogOut, Truck, Package, MapPin, Phone, Clock, CheckCircle2, Navigation, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const DeliveryDashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deliveryPartner, setDeliveryPartner] = useState(null);
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [previousOrderCount, setPreviousOrderCount] = useState(0);
  const audioRef = useRef(null);

  const headers = { Authorization: `Bearer ${token}` };

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('/notification.mp3');
    audioRef.current.volume = 1.0;
  }, []);

  // Play buzzer sound for new delivery assignments
  const playNotificationSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.log('Audio play failed:', err));
    }
  };

  useEffect(() => {
    fetchDeliveryProfile();
  }, []);

  useEffect(() => {
    if (deliveryPartner) {
      fetchOrders();
      const interval = setInterval(() => {
        fetchOrders();
        // Refresh current order if exists
        if (deliveryPartner?.current_order_id) {
          fetchCurrentOrder(deliveryPartner.current_order_id);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [deliveryPartner]);

  const fetchDeliveryProfile = async () => {
    try {
      const response = await axios.get(`${API}/delivery-partners/me`, { headers });
      setDeliveryPartner(response.data);
      setIsAvailable(response.data.status === 'available');
      if (response.data.current_order_id) {
        fetchCurrentOrder(response.data.current_order_id);
      }
    } catch (error) {
      console.error('Failed to fetch delivery profile:', error);
    }
  };

  const fetchCurrentOrder = async (orderId) => {
    try {
      const response = await axios.get(`${API}/orders/${orderId}`, { headers });
      setCurrentOrder(response.data);
    } catch (error) {
      console.error('Failed to fetch current order:', error);
      setCurrentOrder(null);
    }
  };

  const fetchOrders = async () => {
    try {
      // Fetch delivery orders that are ready for pickup OR assigned to this partner
      const response = await axios.get(`${API}/orders?branch_id=${user.branch_id}&order_type=delivery`, { headers });
      // Filter orders that are ready (available for pickup) or assigned to this partner (for status updates)
      const relevantOrders = response.data.filter(order => 
        order.status === 'ready' || 
        (order.delivery_partner_id === deliveryPartner?.id && ['picked_up', 'on_the_way'].includes(order.status))
      );
      
      // Check for new ready orders and play sound
      const readyOrders = relevantOrders.filter(o => o.status === 'ready');
      if (readyOrders.length > previousOrderCount && previousOrderCount >= 0) {
        playNotificationSound();
        toast({ 
          title: '🔔 New Delivery!', 
          description: 'A new order is ready for pickup!',
        });
      }
      setPreviousOrderCount(readyOrders.length);
      setOrders(relevantOrders);
      
      // If this partner has an active delivery, update current order
      const myActiveOrder = response.data.find(order => 
        order.delivery_partner_id === deliveryPartner?.id && 
        ['picked_up', 'on_the_way'].includes(order.status)
      );
      if (myActiveOrder) {
        setCurrentOrder(myActiveOrder);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const handleAvailabilityToggle = async (checked) => {
    try {
      const newStatus = checked ? 'available' : 'offline';
      await axios.put(`${API}/delivery-partners/${deliveryPartner.id}/status`, 
        { status: newStatus }, 
        { headers }
      );
      setIsAvailable(checked);
      toast({ 
        title: checked ? 'You are now available' : 'You are now offline',
        description: checked ? 'You will receive new delivery orders' : 'You will not receive new orders'
      });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  const handlePickupOrder = async (orderId) => {
    try {
      await axios.put(`${API}/orders/${orderId}/assign-delivery`, 
        { delivery_partner_id: deliveryPartner.id }, 
        { headers }
      );
      toast({ title: 'Order picked up', description: 'Navigate to customer location' });
      fetchDeliveryProfile();
      fetchOrders();
    } catch (error) {
      toast({ title: 'Error', description: error.response?.data?.detail || 'Failed to pickup order', variant: 'destructive' });
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${API}/orders/${orderId}/status`, 
        { status: newStatus }, 
        { headers }
      );
      
      const statusMessages = {
        'on_the_way': 'On the way to customer',
        'delivered': 'Order delivered successfully!'
      };
      
      toast({ title: 'Status updated', description: statusMessages[newStatus] });
      
      if (newStatus === 'delivered') {
        setCurrentOrder(null);
        // Refresh delivery partner profile to clear current_order_id
        await fetchDeliveryProfile();
      } else {
        // Update current order state immediately
        setCurrentOrder(prev => prev ? {...prev, status: newStatus} : null);
      }
      fetchOrders();
    } catch (error) {
      toast({ title: 'Error', description: error.response?.data?.detail || 'Failed to update status', variant: 'destructive' });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'ready': { variant: 'default', label: 'Ready for Pickup', color: 'bg-blue-500' },
      'picked_up': { variant: 'secondary', label: 'Picked Up', color: 'bg-yellow-500' },
      'on_the_way': { variant: 'secondary', label: 'On the Way', color: 'bg-red-500' },
      'delivered': { variant: 'default', label: 'Delivered', color: 'bg-green-500' }
    };
    const config = statusConfig[status] || { variant: 'outline', label: status, color: 'bg-gray-500' };
    return <Badge className={`${config.color} text-white`}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="delivery-dashboard">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Truck className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold" data-testid="delivery-title">Delivery Dashboard</h1>
                <p className="text-sm text-red-100">{user?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                className={`${soundEnabled ? 'bg-white text-red-600' : 'bg-red-700 text-white border-red-400'}`}
                onClick={() => setSoundEnabled(!soundEnabled)}
                data-testid="sound-toggle"
              >
                {soundEnabled ? <Volume2 className="h-4 w-4 mr-1" /> : <VolumeX className="h-4 w-4 mr-1" />}
                {soundEnabled ? 'Sound On' : 'Sound Off'}
              </Button>
              <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg">
                <span className="text-sm">{isAvailable ? 'Available' : 'Offline'}</span>
                <Switch 
                  checked={isAvailable} 
                  onCheckedChange={handleAvailabilityToggle}
                  data-testid="availability-toggle"
                />
              </div>
              <Button variant="outline" className="bg-white text-red-600 hover:bg-red-50" onClick={handleLogout} data-testid="logout-button">
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Current Delivery */}
        {currentOrder && (
          <Card className="mb-8 border-2 border-green-500 bg-green-50" data-testid="current-delivery-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-green-600" />
                Current Delivery - {currentOrder.order_number}
              </CardTitle>
              <CardDescription>Active delivery in progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Customer Details</h4>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <span className="font-medium">{currentOrder.customer_name}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      {currentOrder.customer_phone}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      {currentOrder.delivery_address}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Order Items</h4>
                  <div className="space-y-1 text-sm">
                    {currentOrder.items?.map((item, idx) => (
                      <p key={idx}>{item.quantity}x {item.menu_item_name}</p>
                    ))}
                  </div>
                  <p className="mt-2 font-bold text-lg">Total: ₹{currentOrder.total?.toFixed(2)}</p>
                </div>
              </div>
              <div className="mt-6 flex gap-4">
                {currentOrder.status === 'picked_up' && (
                  <Button 
                    onClick={() => handleUpdateStatus(currentOrder.id, 'on_the_way')}
                    className="bg-red-500 hover:bg-red-600"
                    data-testid="on-the-way-button"
                  >
                    <Navigation className="mr-2 h-4 w-4" /> Mark On The Way
                  </Button>
                )}
                {currentOrder.status === 'on_the_way' && (
                  <Button 
                    onClick={() => handleUpdateStatus(currentOrder.id, 'delivered')}
                    className="bg-green-600 hover:bg-green-700"
                    data-testid="delivered-button"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Mark Delivered
                  </Button>
                )}
                {getStatusBadge(currentOrder.status)}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Orders for Pickup */}
        <Card data-testid="available-orders-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Orders Ready for Pickup
            </CardTitle>
            <CardDescription>Pick up orders marked ready by kitchen</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.filter(o => o.status === 'ready').length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>No orders ready for pickup</p>
                <p className="text-sm">New orders will appear here when ready</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.filter(o => o.status === 'ready').map(order => (
                  <Card key={order.id} className="border hover:shadow-md transition-shadow" data-testid={`order-card-${order.id}`}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-lg">{order.order_number}</span>
                            {getStatusBadge(order.status)}
                          </div>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(order.created_at).toLocaleTimeString()}
                          </p>
                          <p className="text-sm mt-1 flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            {order.delivery_address}
                          </p>
                          <p className="font-medium mt-2">₹{order.total?.toFixed(2)}</p>
                        </div>
                        <Button 
                          onClick={() => handlePickupOrder(order.id)}
                          disabled={!isAvailable || currentOrder !== null}
                          className="bg-green-600 hover:bg-green-700"
                          data-testid={`pickup-button-${order.id}`}
                        >
                          <Package className="mr-2 h-4 w-4" /> Pickup Order
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Partner Stats */}
        {deliveryPartner && (
          <Card className="mt-8" data-testid="partner-stats-card">
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Vehicle</p>
                  <p className="font-semibold capitalize">{deliveryPartner.vehicle_type || 'N/A'}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Vehicle Number</p>
                  <p className="font-semibold">{deliveryPartner.vehicle_number || 'N/A'}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className={deliveryPartner.status === 'available' ? 'bg-green-500' : deliveryPartner.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-500'}>
                    {deliveryPartner.status}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold">{deliveryPartner.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboard;
