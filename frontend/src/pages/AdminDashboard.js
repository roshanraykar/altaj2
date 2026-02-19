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
import { LayoutDashboard, Store, UtensilsCrossed, ShoppingBag, BarChart3, LogOut, ChefHat, Users, UserPlus, Ticket, Plus, Trash2, ToggleLeft, ToggleRight, Star, MessageSquare, Eye, EyeOff, Reply } from 'lucide-react';
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
  const [coupons, setCoupons] = useState([]);
  const [showAddCouponDialog, setShowAddCouponDialog] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_value: 0,
    max_discount: 0,
    usage_limit: 0,
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [reviewFilter, setReviewFilter] = useState({ status: 'all', rating: 'all' });
  const [replyText, setReplyText] = useState({});
  const [expandedReview, setExpandedReview] = useState(null);

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
        fetchUsers(),
        fetchCoupons(),
        fetchReviews(),
        fetchReviewStats()
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

  const fetchCoupons = async () => {
    try {
      const response = await axios.get(`${API}/coupons`, { headers });
      setCoupons(response.data);
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
    }
  };

  const handleCreateCoupon = async () => {
    try {
      if (!newCoupon.code) {
        toast({ title: 'Error', description: 'Please enter a coupon code', variant: 'destructive' });
        return;
      }
      
      const couponData = {
        ...newCoupon,
        code: newCoupon.code.toUpperCase(),
        valid_from: new Date(newCoupon.valid_from).toISOString(),
        valid_until: new Date(newCoupon.valid_until).toISOString()
      };
      
      await axios.post(`${API}/coupons`, couponData, { headers });
      toast({ title: 'Success', description: 'Coupon created successfully!' });
      setShowAddCouponDialog(false);
      setNewCoupon({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: 10,
        min_order_value: 0,
        max_discount: 0,
        usage_limit: 0,
        valid_from: new Date().toISOString().split('T')[0],
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      fetchCoupons();
    } catch (error) {
      let errorMsg = 'Please try again';
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        // Handle Pydantic validation errors (array of objects)
        if (Array.isArray(detail)) {
          errorMsg = detail.map(e => e.msg || e.message || JSON.stringify(e)).join(', ');
        } else if (typeof detail === 'string') {
          errorMsg = detail;
        } else if (typeof detail === 'object') {
          errorMsg = detail.msg || detail.message || JSON.stringify(detail);
        }
      }
      toast({ 
        title: 'Failed to create coupon', 
        description: errorMsg, 
        variant: 'destructive' 
      });
    }
  };

  const toggleCouponStatus = async (couponId, currentStatus) => {
    try {
      await axios.put(`${API}/coupons/${couponId}`, { is_active: !currentStatus }, { headers });
      toast({ title: 'Success', description: `Coupon ${!currentStatus ? 'activated' : 'deactivated'}` });
      fetchCoupons();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update coupon', variant: 'destructive' });
    }
  };

  const deleteCoupon = async (couponId) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await axios.delete(`${API}/coupons/${couponId}`, { headers });
      toast({ title: 'Success', description: 'Coupon deleted' });
      fetchCoupons();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete coupon', variant: 'destructive' });
    }
  };

  // Review Management Functions
  const fetchReviews = async () => {
    try {
      let url = `${API}/reviews?sort_by=newest`;
      if (reviewFilter.status !== 'all') url += `&status=${reviewFilter.status}`;
      if (reviewFilter.rating !== 'all') url += `&rating=${reviewFilter.rating}`;
      
      const response = await axios.get(url, { headers });
      setReviews(response.data);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const fetchReviewStats = async () => {
    try {
      const response = await axios.get(`${API}/reviews/stats`, { headers });
      setReviewStats(response.data);
    } catch (error) {
      console.error('Failed to fetch review stats:', error);
    }
  };

  const handlePublishReview = async (reviewId) => {
    try {
      await axios.patch(`${API}/reviews/${reviewId}/publish`, {}, { headers });
      toast({ title: 'Review published' });
      fetchReviews();
      fetchReviewStats();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to publish review', variant: 'destructive' });
    }
  };

  const handleUnpublishReview = async (reviewId) => {
    try {
      await axios.patch(`${API}/reviews/${reviewId}/unpublish`, {}, { headers });
      toast({ title: 'Review unpublished' });
      fetchReviews();
      fetchReviewStats();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to unpublish review', variant: 'destructive' });
    }
  };

  const handleReplyToReview = async (reviewId) => {
    const reply = replyText[reviewId];
    if (!reply?.trim()) return;
    
    try {
      await axios.patch(`${API}/reviews/${reviewId}/reply?admin_response=${encodeURIComponent(reply)}`, {}, { headers });
      toast({ title: 'Reply added' });
      setReplyText(prev => ({ ...prev, [reviewId]: '' }));
      fetchReviews();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add reply', variant: 'destructive' });
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to permanently delete this review?')) return;
    try {
      await axios.delete(`${API}/reviews/${reviewId}`, { headers });
      toast({ title: 'Review deleted' });
      fetchReviews();
      fetchReviewStats();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete review', variant: 'destructive' });
    }
  };

  // Re-fetch reviews when filter changes
  useEffect(() => {
    if (token) fetchReviews();
  }, [reviewFilter]);

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
          <TabsList className="grid w-full grid-cols-7 mb-8">
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
            <TabsTrigger value="coupons" data-testid="tab-coupons">
              <Ticket className="mr-2 h-4 w-4" /> Coupons
            </TabsTrigger>
            <TabsTrigger value="reviews" data-testid="tab-reviews">
              <Star className="mr-2 h-4 w-4" /> Reviews
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

          {/* Coupons Tab */}
          <TabsContent value="coupons">
            <Card data-testid="coupons-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Discount Coupons</CardTitle>
                  <CardDescription>Create and manage promotional coupons</CardDescription>
                </div>
                <Dialog open={showAddCouponDialog} onOpenChange={setShowAddCouponDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-red-600 hover:bg-red-700" data-testid="add-coupon-btn">
                      <Plus className="mr-2 h-4 w-4" /> Create Coupon
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create New Coupon</DialogTitle>
                      <DialogDescription>Set up a promotional discount coupon</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="coupon-code">Coupon Code *</Label>
                        <Input
                          id="coupon-code"
                          placeholder="e.g., SAVE20"
                          value={newCoupon.code}
                          onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                          className="uppercase"
                          data-testid="coupon-code-input"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="discount-type">Discount Type</Label>
                          <Select
                            value={newCoupon.discount_type}
                            onValueChange={(value) => setNewCoupon({ ...newCoupon, discount_type: value })}
                          >
                            <SelectTrigger data-testid="discount-type-select">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">Percentage (%)</SelectItem>
                              <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="discount-value">
                            {newCoupon.discount_type === 'percentage' ? 'Discount %' : 'Discount ₹'}
                          </Label>
                          <Input
                            id="discount-value"
                            type="number"
                            value={newCoupon.discount_value}
                            onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: parseFloat(e.target.value) || 0 })}
                            data-testid="discount-value-input"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="min-order">Min Order Value (₹)</Label>
                          <Input
                            id="min-order"
                            type="number"
                            value={newCoupon.min_order_value}
                            onChange={(e) => setNewCoupon({ ...newCoupon, min_order_value: parseFloat(e.target.value) || 0 })}
                            data-testid="min-order-input"
                          />
                        </div>
                        <div>
                          <Label htmlFor="max-discount">Max Discount (₹)</Label>
                          <Input
                            id="max-discount"
                            type="number"
                            placeholder="0 = No limit"
                            value={newCoupon.max_discount}
                            onChange={(e) => setNewCoupon({ ...newCoupon, max_discount: parseFloat(e.target.value) || 0 })}
                            data-testid="max-discount-input"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="valid-from">Valid From</Label>
                          <Input
                            id="valid-from"
                            type="date"
                            value={newCoupon.valid_from}
                            onChange={(e) => setNewCoupon({ ...newCoupon, valid_from: e.target.value })}
                            data-testid="valid-from-input"
                          />
                        </div>
                        <div>
                          <Label htmlFor="valid-until">Valid Until</Label>
                          <Input
                            id="valid-until"
                            type="date"
                            value={newCoupon.valid_until}
                            onChange={(e) => setNewCoupon({ ...newCoupon, valid_until: e.target.value })}
                            data-testid="valid-until-input"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="usage-limit">Usage Limit (0 = Unlimited)</Label>
                        <Input
                          id="usage-limit"
                          type="number"
                          value={newCoupon.usage_limit}
                          onChange={(e) => setNewCoupon({ ...newCoupon, usage_limit: parseInt(e.target.value) || 0 })}
                          data-testid="usage-limit-input"
                        />
                      </div>
                      <Button onClick={handleCreateCoupon} className="w-full bg-red-600 hover:bg-red-700" data-testid="create-coupon-submit">
                        Create Coupon
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {coupons.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No coupons created yet</p>
                      <p className="text-sm">Click "Create Coupon" to add your first discount code</p>
                    </div>
                  ) : (
                    coupons.map(coupon => (
                      <div 
                        key={coupon.id} 
                        className={`p-4 border-2 rounded-lg ${coupon.is_active ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}
                        data-testid={`coupon-${coupon.id}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-mono text-xl font-bold text-red-600">{coupon.code}</span>
                              <Badge className={coupon.is_active ? 'bg-green-600' : 'bg-gray-500'}>
                                {coupon.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Discount:</span>{' '}
                                {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                              </div>
                              <div>
                                <span className="font-medium">Min Order:</span> ₹{coupon.min_order_value}
                              </div>
                              <div>
                                <span className="font-medium">Max Discount:</span>{' '}
                                {coupon.max_discount > 0 ? `₹${coupon.max_discount}` : 'No limit'}
                              </div>
                              <div>
                                <span className="font-medium">Uses:</span>{' '}
                                {coupon.times_used || 0}{coupon.usage_limit > 0 ? `/${coupon.usage_limit}` : ''}
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                              Valid: {new Date(coupon.valid_from).toLocaleDateString()} - {new Date(coupon.valid_until).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleCouponStatus(coupon.id, coupon.is_active)}
                              className={coupon.is_active ? 'text-orange-600 border-orange-300' : 'text-green-600 border-green-300'}
                              data-testid={`toggle-coupon-${coupon.id}`}
                            >
                              {coupon.is_active ? <ToggleRight className="h-4 w-4 mr-1" /> : <ToggleLeft className="h-4 w-4 mr-1" />}
                              {coupon.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteCoupon(coupon.id)}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                              data-testid={`delete-coupon-${coupon.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            {/* Review Stats Cards */}
            {reviewStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500 fill-yellow-500" />
                    <p className="text-3xl font-bold">{reviewStats.average_rating}</p>
                    <p className="text-sm text-gray-500">Average Rating</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <p className="text-3xl font-bold">{reviewStats.total_reviews}</p>
                    <p className="text-sm text-gray-500">Total Reviews</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Eye className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="text-3xl font-bold">{reviewStats.published_count}</p>
                    <p className="text-sm text-gray-500">Published</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <EyeOff className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                    <p className="text-3xl font-bold">{reviewStats.private_count}</p>
                    <p className="text-sm text-gray-500">Private</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Rating Distribution */}
            {reviewStats && reviewStats.total_reviews > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Rating Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map(rating => {
                      const count = reviewStats.rating_distribution[rating] || 0;
                      const percentage = reviewStats.total_reviews > 0 
                        ? Math.round((count / reviewStats.total_reviews) * 100) 
                        : 0;
                      return (
                        <div key={rating} className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-16">
                            <span className="font-medium">{rating}</span>
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-yellow-400 h-3 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-16">{count} ({percentage}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="pt-4">
                <div className="flex gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Label>Status:</Label>
                    <Select value={reviewFilter.status} onValueChange={(v) => setReviewFilter({...reviewFilter, status: v})}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label>Rating:</Label>
                    <Select value={reviewFilter.rating} onValueChange={(v) => setReviewFilter({...reviewFilter, rating: v})}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Stars</SelectItem>
                        <SelectItem value="5">5 Stars</SelectItem>
                        <SelectItem value="4">4 Stars</SelectItem>
                        <SelectItem value="3">3 Stars</SelectItem>
                        <SelectItem value="2">2 Stars</SelectItem>
                        <SelectItem value="1">1 Star</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews List */}
            <Card data-testid="reviews-list-card">
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
                <CardDescription>Manage and respond to customer feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No reviews yet</p>
                      <p className="text-sm">Customer reviews will appear here</p>
                    </div>
                  ) : (
                    reviews.map(review => (
                      <div 
                        key={review.id} 
                        className={`p-4 border-2 rounded-lg ${
                          review.status === 'published' ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
                        }`}
                        data-testid={`review-${review.id}`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{review.customer_name}</span>
                              <Badge className={review.status === 'published' ? 'bg-green-600' : 'bg-gray-500'}>
                                {review.status === 'published' ? 'Published' : 'Private'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star 
                                  key={star} 
                                  className={`h-4 w-4 ${star <= review.star_rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                />
                              ))}
                              <span className="text-sm text-gray-500 ml-2">
                                {new Date(review.created_at).toLocaleDateString('en-IN', { 
                                  day: 'numeric', month: 'short', year: 'numeric' 
                                })}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {review.status === 'private' ? (
                              <Button 
                                size="sm" 
                                onClick={() => handlePublishReview(review.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Eye className="h-4 w-4 mr-1" /> Publish
                              </Button>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleUnpublishReview(review.id)}
                              >
                                <EyeOff className="h-4 w-4 mr-1" /> Unpublish
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-red-600 border-red-300"
                              onClick={() => handleDeleteReview(review.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Review Text */}
                        {review.review_text && (
                          <p className="text-gray-700 mb-3 bg-white/50 p-3 rounded-lg">"{review.review_text}"</p>
                        )}

                        {/* Order Details (Expandable) */}
                        {review.order_details && (
                          <div className="text-sm text-gray-600 mb-3">
                            <span className="font-medium">Order:</span> #{review.order_details.order_number} • 
                            ₹{review.order_details.total} • {review.order_details.items?.length || 0} items
                          </div>
                        )}

                        {/* Admin Response */}
                        {review.admin_response && (
                          <div className="bg-blue-50 p-3 rounded-lg mb-3 border-l-4 border-blue-500">
                            <p className="text-sm font-medium text-blue-800 mb-1">Restaurant replied:</p>
                            <p className="text-gray-700">{review.admin_response}</p>
                          </div>
                        )}

                        {/* Reply Form */}
                        {!review.admin_response && (
                          <div className="flex gap-2 mt-3">
                            <Input
                              placeholder="Write a reply... (max 300 chars)"
                              value={replyText[review.id] || ''}
                              onChange={(e) => setReplyText(prev => ({ 
                                ...prev, 
                                [review.id]: e.target.value.slice(0, 300) 
                              }))}
                              className="flex-1"
                            />
                            <Button 
                              size="sm"
                              onClick={() => handleReplyToReview(review.id)}
                              disabled={!replyText[review.id]?.trim()}
                            >
                              <Reply className="h-4 w-4 mr-1" /> Reply
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
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