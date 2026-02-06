import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LogOut, ShoppingBag, Clock, MapPin, Phone, User, Package, 
  Truck, Utensils, CheckCircle2, XCircle, RefreshCw, ChefHat,
  Calendar, CreditCard, Receipt
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CustomerDashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchOrders();
    // Auto-refresh every 10 seconds for active orders
    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders/my-orders`, { headers });
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast({ title: 'Error', description: 'Failed to load orders', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusConfig = (status) => {
    const configs = {
      'pending': { color: 'bg-gray-500', icon: Clock, label: 'Order Placed', step: 1 },
      'confirmed': { color: 'bg-blue-500', icon: CheckCircle2, label: 'Confirmed', step: 2 },
      'preparing': { color: 'bg-yellow-500', icon: ChefHat, label: 'Preparing', step: 3 },
      'ready': { color: 'bg-green-500', icon: Package, label: 'Ready', step: 4 },
      'picked_up': { color: 'bg-red-500', icon: Truck, label: 'Picked Up', step: 5 },
      'on_the_way': { color: 'bg-red-600', icon: Truck, label: 'On the Way', step: 6 },
      'delivered': { color: 'bg-green-600', icon: CheckCircle2, label: 'Delivered', step: 7 },
      'served': { color: 'bg-green-500', icon: Utensils, label: 'Served', step: 5 },
      'completed': { color: 'bg-green-700', icon: CheckCircle2, label: 'Completed', step: 8 },
      'cancelled': { color: 'bg-red-500', icon: XCircle, label: 'Cancelled', step: 0 }
    };
    return configs[status] || configs['pending'];
  };

  const getOrderTypeIcon = (type) => {
    switch(type) {
      case 'delivery': return <Truck className="h-4 w-4" />;
      case 'dine_in': return <Utensils className="h-4 w-4" />;
      case 'takeaway': return <Package className="h-4 w-4" />;
      default: return <ShoppingBag className="h-4 w-4" />;
    }
  };

  const isActiveOrder = (status) => {
    return !['completed', 'delivered', 'cancelled'].includes(status);
  };

  const activeOrders = orders.filter(o => isActiveOrder(o.status));
  const pastOrders = orders.filter(o => !isActiveOrder(o.status));

  const OrderCard = ({ order, isActive }) => {
    const statusConfig = getStatusConfig(order.status);
    const StatusIcon = statusConfig.icon;
    
    return (
      <Card className={`mb-4 ${isActive ? 'border-2 border-red-300 shadow-lg' : ''}`} data-testid={`order-card-${order.id}`}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="h-5 w-5 text-red-600" />
                {order.order_number}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                {getOrderTypeIcon(order.order_type)}
                <span className="capitalize">{order.order_type?.replace('_', ' ')}</span>
                <span className="text-gray-400">•</span>
                <Calendar className="h-3 w-3" />
                {new Date(order.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </CardDescription>
            </div>
            <Badge className={`${statusConfig.color} text-white`} data-testid={`order-status-${order.id}`}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress Steps for Active Orders */}
          {isActive && order.order_type === 'delivery' && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                {['Order Placed', 'Confirmed', 'Preparing', 'Ready', 'On the Way', 'Delivered'].map((step, idx) => {
                  const stepNum = idx + 1;
                  const currentStep = statusConfig.step;
                  const isCompleted = stepNum <= currentStep;
                  const isCurrent = stepNum === currentStep;
                  return (
                    <div key={step} className="flex flex-col items-center flex-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                      } ${isCurrent ? 'ring-2 ring-red-400 ring-offset-2' : ''}`}>
                        {isCompleted ? '✓' : stepNum}
                      </div>
                      <span className={`text-xs mt-1 text-center ${isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <h4 className="font-semibold text-sm mb-2 text-gray-700">Order Items</h4>
            <div className="space-y-1">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.menu_item_name}</span>
                  <span className="text-gray-600">₹{item.total_price?.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              {order.delivery_address && (
                <p className="flex items-start gap-2 text-gray-600 mb-1">
                  <MapPin className="h-4 w-4 mt-0.5 text-gray-400" />
                  <span>{order.delivery_address}</span>
                </p>
              )}
              {order.table_id && (
                <p className="flex items-center gap-2 text-gray-600">
                  <Utensils className="h-4 w-4 text-gray-400" />
                  <span>Table: {order.table_number || 'Assigned'}</span>
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-gray-500">Subtotal: ₹{order.subtotal?.toFixed(2)}</p>
              <p className="text-gray-500">GST (5%): ₹{order.tax?.toFixed(2)}</p>
              <p className="font-bold text-lg text-red-600">Total: ₹{order.total?.toFixed(2)}</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="mt-3 pt-3 border-t flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4 text-gray-400" />
              <span className="capitalize">{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span>
              <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'} className="text-xs">
                {order.payment_status || 'Pending'}
              </Badge>
            </div>
            {isActive && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/track/${order.id}`)}
                data-testid={`track-order-${order.id}`}
              >
                Track Order
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-50" data-testid="customer-dashboard">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 via-red-500 to-red-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img src="/altaj-logo.png" alt="Al Taj" className="h-12 w-auto" />
              <div>
                <h1 className="text-2xl font-bold" data-testid="dashboard-title">My Orders</h1>
                <p className="text-red-100 text-sm flex items-center gap-2">
                  <User className="h-3 w-3" />
                  {user?.name || user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                onClick={() => navigate('/order')}
                data-testid="new-order-button"
              >
                <ShoppingBag className="mr-2 h-4 w-4" /> New Order
              </Button>
              <Button 
                variant="outline" 
                className="bg-white text-red-600 hover:bg-red-50"
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
        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white">
            <CardContent className="pt-6 text-center">
              <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-red-500" />
              <p className="text-2xl font-bold">{orders.length}</p>
              <p className="text-sm text-gray-500">Total Orders</p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="pt-6 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold">{activeOrders.length}</p>
              <p className="text-sm text-gray-500">Active Orders</p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{pastOrders.filter(o => o.status !== 'cancelled').length}</p>
              <p className="text-sm text-gray-500">Completed</p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="pt-6 text-center">
              <Receipt className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">
                ₹{orders.reduce((sum, o) => sum + (o.total || 0), 0).toFixed(0)}
              </p>
              <p className="text-sm text-gray-500">Total Spent</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="active" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
              <Clock className="h-4 w-4 mr-2" />
              Active Orders ({activeOrders.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Order History ({pastOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-red-500" />
                <p className="text-gray-500">Loading orders...</p>
              </div>
            ) : activeOrders.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Active Orders</h3>
                  <p className="text-gray-500 mb-4">Place an order to see it here</p>
                  <Button onClick={() => navigate('/order')} className="bg-red-500 hover:bg-red-600">
                    <ShoppingBag className="mr-2 h-4 w-4" /> Order Now
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div>
                {activeOrders.map(order => (
                  <OrderCard key={order.id} order={order} isActive={true} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            {pastOrders.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <Receipt className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-600">No Past Orders</h3>
                  <p className="text-gray-500">Your completed orders will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div>
                {pastOrders.map(order => (
                  <OrderCard key={order.id} order={order} isActive={false} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CustomerDashboard;
