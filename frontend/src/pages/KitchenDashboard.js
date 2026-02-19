import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, ChefHat, Clock, CheckCircle2, Volume2, VolumeX, Bell, BellOff, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const KitchenDashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [acknowledgedOrders, setAcknowledgedOrders] = useState(new Set());
  const [alertingOrders, setAlertingOrders] = useState(new Set());
  const audioRef = useRef(null);
  const alertIntervalRef = useRef(null);

  const headers = { Authorization: `Bearer ${token}` };

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('/notification.mp3');
    audioRef.current.volume = 1.0;
    
    return () => {
      if (alertIntervalRef.current) {
        clearInterval(alertIntervalRef.current);
      }
      // Stop audio on unmount
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  // Stop audio immediately when sound is disabled
  useEffect(() => {
    if (!soundEnabled && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    // Clear interval when sound is disabled
    if (!soundEnabled && alertIntervalRef.current) {
      clearInterval(alertIntervalRef.current);
      alertIntervalRef.current = null;
    }
  }, [soundEnabled]);

  // Play buzzer sound - only if sound is enabled
  const playBuzzer = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.log('Audio play failed:', err));
    }
  }, [soundEnabled]);

  // Start continuous alert for an order
  const startAlert = useCallback((orderId) => {
    if (!alertingOrders.has(orderId)) {
      setAlertingOrders(prev => new Set([...prev, orderId]));
      playBuzzer();
    }
  }, [alertingOrders, playBuzzer]);

  // Acknowledge and stop alert for an order
  const acknowledgeOrder = useCallback((orderId) => {
    setAcknowledgedOrders(prev => new Set([...prev, orderId]));
    setAlertingOrders(prev => {
      const newSet = new Set(prev);
      newSet.delete(orderId);
      return newSet;
    });
  }, []);

  // Continuous buzzer for unacknowledged orders
  useEffect(() => {
    if (alertIntervalRef.current) {
      clearInterval(alertIntervalRef.current);
    }

    if (alertingOrders.size > 0 && soundEnabled) {
      playBuzzer(); // Play immediately
      alertIntervalRef.current = setInterval(() => {
        playBuzzer();
      }, 3000); // Repeat every 3 seconds
    }

    return () => {
      if (alertIntervalRef.current) {
        clearInterval(alertIntervalRef.current);
      }
    };
  }, [alertingOrders, soundEnabled, playBuzzer]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders?branch_id=${user.branch_id}`, { headers });
      const activeOrders = response.data.filter(order => 
        !['completed', 'cancelled'].includes(order.status)
      );
      
      // Check for new pending orders that haven't been acknowledged
      activeOrders.forEach(order => {
        if (order.status === 'pending' && !acknowledgedOrders.has(order.id)) {
          startAlert(order.id);
        }
      });

      setOrders(activeOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${API}/orders/${orderId}/status`, { status: newStatus }, { headers });
      toast({ title: 'Status updated', description: `Order status changed to ${newStatus}` });
      acknowledgeOrder(orderId); // Auto-acknowledge when status changes
      fetchOrders();
    } catch (error) {
      toast({ title: 'Update failed', description: error.response?.data?.detail || 'Please try again', variant: 'destructive' });
    }
  };

  const getOrderTypeIcon = (orderType) => {
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

  const isOrderAlerting = (orderId) => alertingOrders.has(orderId);

  // Print order receipt for thermal printer (58mm / 2 inch width)
  const printOrderReceipt = (order) => {
    const printWindow = window.open('', '_blank', 'width=300,height=600');
    
    const receiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order #${order.order_number}</title>
        <style>
          @page {
            size: 58mm auto;
            margin: 0;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            width: 58mm;
            padding: 3mm;
            line-height: 1.4;
          }
          .header {
            text-align: center;
            border-bottom: 1px dashed #000;
            padding-bottom: 8px;
            margin-bottom: 8px;
          }
          .restaurant-name {
            font-size: 16px;
            font-weight: bold;
          }
          .order-number {
            font-size: 24px;
            font-weight: bold;
            margin: 10px 0;
          }
          .order-type {
            font-size: 14px;
            text-transform: uppercase;
            font-weight: bold;
            background: #000;
            color: #fff;
            padding: 4px;
            margin: 5px 0;
          }
          .divider {
            border-top: 1px dashed #000;
            margin: 8px 0;
          }
          .items-section {
            margin: 10px 0;
          }
          .item {
            display: flex;
            justify-content: space-between;
            margin: 6px 0;
            font-size: 14px;
          }
          .item-qty {
            font-weight: bold;
            min-width: 30px;
          }
          .item-name {
            flex: 1;
            padding-left: 5px;
          }
          .instructions {
            border: 1px solid #000;
            padding: 8px;
            margin: 10px 0;
            font-size: 12px;
          }
          .instructions-label {
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 4px;
          }
          .footer {
            text-align: center;
            border-top: 1px dashed #000;
            padding-top: 8px;
            margin-top: 8px;
            font-size: 10px;
          }
          .time {
            font-size: 11px;
            margin-top: 5px;
          }
          @media print {
            body {
              width: 58mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="restaurant-name">AL TAJ RESTAURANT</div>
          <div class="order-number">#${order.order_number}</div>
          <div class="order-type">${order.order_type === 'delivery' ? '🚗 DELIVERY' : '📦 TAKEAWAY'}</div>
        </div>
        
        <div class="divider"></div>
        
        <div class="items-section">
          ${order.items.map(item => `
            <div class="item">
              <span class="item-qty">${item.quantity}x</span>
              <span class="item-name">${item.menu_item_name}</span>
            </div>
          `).join('')}
        </div>
        
        ${order.special_instructions ? `
          <div class="instructions">
            <div class="instructions-label">⚠️ SPECIAL INSTRUCTIONS:</div>
            <div>${order.special_instructions}</div>
          </div>
        ` : ''}
        
        <div class="divider"></div>
        
        <div class="footer">
          <div class="time">Printed: ${new Date().toLocaleString('en-IN', { 
            day: '2-digit', 
            month: 'short', 
            hour: '2-digit', 
            minute: '2-digit'
          })}</div>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(receiptContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" data-testid="kitchen-dashboard">
      {/* Header with brand colors */}
      <header className="bg-gradient-to-r from-[#b2101f] to-[#e70825] text-white shadow-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <ChefHat className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-wide" data-testid="kitchen-title">Kitchen Dashboard</h1>
                <p className="text-sm text-white/80">{user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {alertingOrders.size > 0 && (
                <div className="flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-lg animate-pulse">
                  <Bell className="h-5 w-5" />
                  <span className="font-bold">{alertingOrders.size} New Order(s)!</span>
                </div>
              )}
              <Button 
                variant="outline" 
                size="sm"
                className={`border-2 ${soundEnabled ? 'bg-white text-[#b2101f] border-white' : 'bg-transparent text-white border-white/50'}`}
                onClick={() => setSoundEnabled(!soundEnabled)}
                data-testid="sound-toggle"
              >
                {soundEnabled ? <Volume2 className="h-4 w-4 mr-1" /> : <VolumeX className="h-4 w-4 mr-1" />}
                {soundEnabled ? 'Sound On' : 'Sound Off'}
              </Button>
              <Button 
                variant="outline" 
                className="bg-white text-[#b2101f] hover:bg-gray-100 border-2 border-white" 
                onClick={handleLogout} 
                data-testid="logout-button"
              >
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pending Orders */}
          <div data-testid="pending-orders-section">
            <h2 className="text-xl font-bold mb-4 flex items-center text-gray-800">
              <Clock className="mr-2 h-5 w-5 text-yellow-600" />
              Pending ({groupedOrders.pending.length})
            </h2>
            <div className="space-y-4">
              {groupedOrders.pending.map(order => (
                <Card 
                  key={order.id} 
                  className={`border-2 shadow-lg transition-all ${
                    isOrderAlerting(order.id) 
                      ? 'border-red-500 bg-red-50 animate-pulse ring-4 ring-red-300' 
                      : 'border-yellow-300 bg-yellow-50'
                  }`}
                  data-testid={`pending-order-${order.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-bold">#{order.order_number}</CardTitle>
                        <p className="text-sm text-gray-600">
                          {getOrderTypeIcon(order.order_type)} {order.order_type.replace('_', ' ')}
                        </p>
                      </div>
                      {isOrderAlerting(order.id) ? (
                        <Badge className="bg-red-600 animate-bounce">🔔 NEW!</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-100 border-yellow-400">Pending</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4 bg-white/60 p-3 rounded-lg">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm" data-testid={`order-item-${order.id}-${idx}`}>
                          <span className="font-medium">{item.quantity}x {item.menu_item_name}</span>
                        </div>
                      ))}
                    </div>
                    {order.special_instructions && (
                      <p className="text-sm text-red-700 mb-3 p-2 bg-red-100 rounded-lg border border-red-200">
                        ⚠️ {order.special_instructions}
                      </p>
                    )}
                    
                    {/* Acknowledge button for alerting orders */}
                    {isOrderAlerting(order.id) && (
                      <Button
                        onClick={() => acknowledgeOrder(order.id)}
                        className="w-full mb-2 bg-orange-500 hover:bg-orange-600 text-white"
                        data-testid={`acknowledge-order-${order.id}`}
                      >
                        <BellOff className="mr-2 h-4 w-4" /> Stop Alert
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => updateOrderStatus(order.id, 'confirmed')}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      data-testid={`confirm-order-${order.id}`}
                    >
                      ✓ Confirm Order
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Confirmed Orders */}
          <div data-testid="confirmed-orders-section">
            <h2 className="text-xl font-bold mb-4 flex items-center text-gray-800">
              <CheckCircle2 className="mr-2 h-5 w-5 text-blue-600" />
              Confirmed ({groupedOrders.confirmed.length})
            </h2>
            <div className="space-y-4">
              {groupedOrders.confirmed.map(order => (
                <Card key={order.id} className="border-2 border-blue-300 bg-blue-50 shadow-lg" data-testid={`confirmed-order-${order.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-bold">#{order.order_number}</CardTitle>
                        <p className="text-sm text-gray-600">
                          {getOrderTypeIcon(order.order_type)} {order.order_type.replace('_', ' ')}
                        </p>
                      </div>
                      <Badge className="bg-blue-600">Confirmed</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4 bg-white/60 p-3 rounded-lg">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="font-medium">{item.quantity}x {item.menu_item_name}</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                      className="w-full bg-[#b2101f] hover:bg-[#8a0c18]"
                      data-testid={`start-preparing-${order.id}`}
                    >
                      🍳 Start Preparing
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Preparing Orders */}
          <div data-testid="preparing-orders-section">
            <h2 className="text-xl font-bold mb-4 flex items-center text-gray-800">
              <ChefHat className="mr-2 h-5 w-5 text-[#b2101f]" />
              Preparing ({groupedOrders.preparing.length})
            </h2>
            <div className="space-y-4">
              {groupedOrders.preparing.map(order => (
                <Card key={order.id} className="border-2 border-[#c59433] bg-amber-50 shadow-lg" data-testid={`preparing-order-${order.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-bold">#{order.order_number}</CardTitle>
                        <p className="text-sm text-gray-600">
                          {getOrderTypeIcon(order.order_type)} {order.order_type.replace('_', ' ')}
                        </p>
                      </div>
                      <Badge className="bg-[#c59433]">Cooking</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4 bg-white/60 p-3 rounded-lg">
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
                      ✓ Mark as Ready
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Ready Orders */}
          <div data-testid="ready-orders-section">
            <h2 className="text-xl font-bold mb-4 flex items-center text-gray-800">
              <CheckCircle2 className="mr-2 h-5 w-5 text-green-600" />
              Ready ({groupedOrders.ready.length})
            </h2>
            <div className="space-y-4">
              {groupedOrders.ready.map(order => (
                <Card key={order.id} className="border-2 border-green-300 bg-green-50 shadow-lg" data-testid={`ready-order-${order.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-bold">#{order.order_number}</CardTitle>
                        <p className="text-sm text-gray-600">
                          {getOrderTypeIcon(order.order_type)} {order.order_type.replace('_', ' ')}
                        </p>
                      </div>
                      <Badge className="bg-green-600">Ready!</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4 bg-white/60 p-3 rounded-lg">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.menu_item_name}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-green-700 font-semibold text-center py-2 bg-green-100 rounded-lg">
                      ✓ Ready for Pickup/Delivery
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {orders.length === 0 && (
          <Card className="mt-8 border-2 border-gray-200 shadow-lg">
            <CardContent className="pt-6 text-center text-gray-500">
              <ChefHat className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No active orders at the moment</p>
              <p className="text-sm">New orders will appear here automatically</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default KitchenDashboard;
