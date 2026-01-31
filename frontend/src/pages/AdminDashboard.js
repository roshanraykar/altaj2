import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LayoutDashboard, Store, UtensilsCrossed, ShoppingBag, BarChart3, LogOut, ChefHat, Users, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminDashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState(null);
  const [branches, setBranches] = useState([]);
  const [orders, setOrders] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'waiter',
    branch_id: ''
  });

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchOrders, 10000); // Refresh orders every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      await Promise.all([
        fetchStats(),
        fetchBranches(),
        fetchOrders(),
        fetchPerformance(),
        fetchUsers()
      ]);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`, { headers });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await axios.get(`${API}/branches`, { headers });
      setBranches(response.data);
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders`, { headers });
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const fetchPerformance = async () => {
    try {
      const response = await axios.get(`${API}/reports/branch-performance`, { headers });
      setPerformanceData(response.data);
    } catch (error) {
      console.error('Failed to fetch performance:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/users`, { headers });
      setAllUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleCreateUser = async () => {
    try {
      // Validate required fields
      if (!newUser.email || !newUser.password || !newUser.name || !newUser.phone) {
        toast({ title: 'Validation Error', description: 'Please fill all required fields', variant: 'destructive' });
        return;
      }

      // Validate branch_id for branch-specific roles
      if (['waiter', 'kitchen_staff', 'branch_manager'].includes(newUser.role) && !newUser.branch_id) {
        toast({ title: 'Validation Error', description: 'Please select a branch for this role', variant: 'destructive' });
        return;
      }

      await axios.post(`${API}/auth/register`, newUser, { headers });
      toast({ title: 'Success', description: `${newUser.role} created successfully!` });
      setShowAddUserDialog(false);
      setNewUser({ email: '', password: '', name: '', phone: '', role: 'waiter', branch_id: '' });
      fetchUsers();
    } catch (error) {
      toast({ 
        title: 'Failed to create user', 
        description: error.response?.data?.detail || 'Please try again', 
        variant: 'destructive' 
      });
    }
  };

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="admin-dashboard">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <ChefHat className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold" data-testid="admin-title">Al Taj Admin</h1>
                <p className="text-sm text-orange-100">{user?.name} ({user?.role})</p>
              </div>
            </div>
            <Button variant="outline" className="bg-white text-orange-600 hover:bg-orange-50" onClick={handleLogout} data-testid="logout-button">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="dashboard" data-testid="tab-dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="branches" data-testid="tab-branches">
              <Store className="mr-2 h-4 w-4" /> Branches
            </TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">
              <ShoppingBag className="mr-2 h-4 w-4" /> Orders
            </TabsTrigger>
            <TabsTrigger value="reports" data-testid="tab-reports">
              <BarChart3 className="mr-2 h-4 w-4" /> Reports
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card data-testid="stat-card-total-orders">
                <CardHeader className="pb-3">
                  <CardDescription>Total Orders</CardDescription>
                  <CardTitle className="text-3xl">{stats?.total_orders || 0}</CardTitle>
                </CardHeader>
              </Card>
              <Card data-testid="stat-card-today-revenue">
                <CardHeader className="pb-3">
                  <CardDescription>Today's Revenue</CardDescription>
                  <CardTitle className="text-3xl text-green-600">AED {stats?.today_revenue || 0}</CardTitle>
                </CardHeader>
              </Card>
              <Card data-testid="stat-card-today-orders">
                <CardHeader className="pb-3">
                  <CardDescription>Today's Orders</CardDescription>
                  <CardTitle className="text-3xl">{stats?.today_orders || 0}</CardTitle>
                </CardHeader>
              </Card>
              <Card data-testid="stat-card-pending-orders">
                <CardHeader className="pb-3">
                  <CardDescription>Pending Orders</CardDescription>
                  <CardTitle className="text-3xl text-orange-600">{stats?.orders_by_status?.pending || 0}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Card data-testid="recent-orders-card">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest orders across all branches</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.slice(0, 10).map(order => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50" data-testid={`order-row-${order.id}`}>
                      <div className="flex-1">
                        <p className="font-semibold">#{order.order_number}</p>
                        <p className="text-sm text-gray-600">{order.customer_name} - {order.customer_phone}</p>
                        <p className="text-xs text-gray-500 capitalize">{order.order_type.replace('_', ' ')}</p>
                      </div>
                      <div className="text-right mr-4">
                        <p className="font-bold text-orange-600">AED {order.total.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">{order.items.length} items</p>
                      </div>
                      <Badge className={getStatusColor(order.status)} data-testid={`order-status-${order.id}`}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branches Tab */}
          <TabsContent value="branches">
            <Card data-testid="branches-list-card">
              <CardHeader>
                <CardTitle>All Branches</CardTitle>
                <CardDescription>Manage your restaurant locations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {branches.map(branch => (
                    <Card key={branch.id} className="hover:shadow-lg transition-shadow" data-testid={`branch-detail-${branch.id}`}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-lg">{branch.name}</h3>
                          <Badge variant={branch.is_active ? 'default' : 'secondary'}>
                            {branch.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p><strong>Address:</strong> {branch.address}</p>
                          <p><strong>Phone:</strong> {branch.phone}</p>
                          <p><strong>Email:</strong> {branch.email}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card data-testid="all-orders-card">
              <CardHeader>
                <CardTitle>All Orders</CardTitle>
                <CardDescription>View and manage all orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orders.map(order => (
                    <div key={order.id} className="p-4 border rounded-lg hover:bg-gray-50" data-testid={`all-order-${order.id}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-lg">#{order.order_number}</p>
                          <p className="text-sm text-gray-600">{order.customer_name} - {order.customer_phone}</p>
                          <p className="text-sm text-gray-500">Branch: {branches.find(b => b.id === order.branch_id)?.name}</p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <div>
                          <p className="text-sm text-gray-600 capitalize">{order.order_type.replace('_', ' ')} - {order.items.length} items</p>
                        </div>
                        <p className="font-bold text-orange-600 text-lg">AED {order.total.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card data-testid="performance-report-card">
              <CardHeader>
                <CardTitle>Branch Performance</CardTitle>
                <CardDescription>Revenue and order statistics by branch</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceData.map(branch => (
                    <div key={branch.branch_id} className="p-4 border rounded-lg" data-testid={`performance-${branch.branch_id}`}>
                      <h3 className="font-bold text-lg mb-3">{branch.branch_name}</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Total Revenue</p>
                          <p className="text-2xl font-bold text-green-600">AED {branch.total_revenue}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Orders</p>
                          <p className="text-2xl font-bold">{branch.total_orders}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Avg Order Value</p>
                          <p className="text-2xl font-bold text-orange-600">AED {branch.avg_order_value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;