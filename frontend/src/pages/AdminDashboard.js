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
import { LayoutDashboard, Store, UtensilsCrossed, ShoppingBag, BarChart3, LogOut, ChefHat, Users, UserPlus, Ticket, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
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
      <header className="bg-gradient-to-r from-red-600 to-red-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <ChefHat className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold" data-testid="admin-title">Al Taj Admin</h1>
                <p className="text-sm text-red-100">{user?.name} ({user?.role})</p>
              </div>
            </div>
            <Button variant="outline" className="bg-white text-red-600 hover:bg-red-50" onClick={handleLogout} data-testid="logout-button">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="dashboard" data-testid="tab-dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="branches" data-testid="tab-branches">
              <Store className="mr-2 h-4 w-4" /> Branches
            </TabsTrigger>
            <TabsTrigger value="staff" data-testid="tab-staff">
              <Users className="mr-2 h-4 w-4" /> Staff
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
                  <CardTitle className="text-3xl text-green-600">₹{stats?.today_revenue || 0}</CardTitle>
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
                  <CardTitle className="text-3xl text-red-600">{stats?.orders_by_status?.pending || 0}</CardTitle>
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
                        <p className="font-bold text-red-600">₹{order.total.toFixed(2)}</p>
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

          {/* Staff Management Tab */}
          <TabsContent value="staff">
            <Card data-testid="staff-management-card">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Staff Management</CardTitle>
                    <CardDescription>Manage users across all branches</CardDescription>
                  </div>
                  <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-red-600 hover:bg-red-700" data-testid="add-staff-button">
                        <UserPlus className="mr-2 h-4 w-4" /> Add Staff Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md" data-testid="add-staff-dialog">
                      <DialogHeader>
                        <DialogTitle>Add New Staff Member</DialogTitle>
                        <DialogDescription>Create a new user account for staff</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="staff-name">Full Name *</Label>
                          <Input
                            id="staff-name"
                            value={newUser.name}
                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                            placeholder="John Doe"
                            data-testid="staff-name-input"
                          />
                        </div>
                        <div>
                          <Label htmlFor="staff-email">Email *</Label>
                          <Input
                            id="staff-email"
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            placeholder="john@altaj.com"
                            data-testid="staff-email-input"
                          />
                        </div>
                        <div>
                          <Label htmlFor="staff-phone">Phone *</Label>
                          <Input
                            id="staff-phone"
                            value={newUser.phone}
                            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                            placeholder="+971-50-XXX-XXXX"
                            data-testid="staff-phone-input"
                          />
                        </div>
                        <div>
                          <Label htmlFor="staff-password">Password *</Label>
                          <Input
                            id="staff-password"
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            placeholder="••••••••"
                            data-testid="staff-password-input"
                          />
                        </div>
                        <div>
                          <Label htmlFor="staff-role">Role *</Label>
                          <Select 
                            value={newUser.role} 
                            onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                            data-testid="staff-role-select"
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="branch_manager">Branch Manager</SelectItem>
                              <SelectItem value="waiter">Waiter</SelectItem>
                              <SelectItem value="kitchen_staff">Kitchen Staff</SelectItem>
                              <SelectItem value="delivery_partner">Delivery Partner</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {['waiter', 'kitchen_staff', 'branch_manager', 'delivery_partner'].includes(newUser.role) && (
                          <div>
                            <Label htmlFor="staff-branch">Branch *</Label>
                            <Select 
                              value={newUser.branch_id} 
                              onValueChange={(value) => setNewUser({ ...newUser, branch_id: value })}
                              data-testid="staff-branch-select"
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select branch" />
                              </SelectTrigger>
                              <SelectContent>
                                {branches.map(branch => (
                                  <SelectItem key={branch.id} value={branch.id}>
                                    {branch.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        <Button 
                          onClick={handleCreateUser} 
                          className="w-full bg-red-600 hover:bg-red-700"
                          data-testid="create-staff-button"
                        >
                          Create Staff Member
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allUsers.map(staffUser => {
                    const userBranch = branches.find(b => b.id === staffUser.branch_id);
                    return (
                      <div 
                        key={staffUser.id} 
                        className="p-4 border rounded-lg hover:bg-gray-50 flex items-center justify-between"
                        data-testid={`staff-row-${staffUser.id}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-lg">{staffUser.name}</h3>
                            <Badge 
                              variant={staffUser.role === 'admin' ? 'destructive' : 'default'}
                              data-testid={`staff-role-badge-${staffUser.id}`}
                            >
                              {staffUser.role.replace('_', ' ')}
                            </Badge>
                            <Badge variant={staffUser.is_active ? 'default' : 'secondary'}>
                              {staffUser.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>Email:</strong> {staffUser.email}</p>
                            {staffUser.phone && <p><strong>Phone:</strong> {staffUser.phone}</p>}
                            {userBranch && (
                              <p><strong>Branch:</strong> {userBranch.name}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {allUsers.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No staff members found</p>
                  )}
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
                        <p className="font-bold text-red-600 text-lg">₹{order.total.toFixed(2)}</p>
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
                          <p className="text-2xl font-bold text-green-600">₹{branch.total_revenue}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Orders</p>
                          <p className="text-2xl font-bold">{branch.total_orders}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Avg Order Value</p>
                          <p className="text-2xl font-bold text-red-600">₹{branch.avg_order_value}</p>
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