import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogOut, ChefHat, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const WaiterDashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchTables();
    fetchOrders();
    const interval = setInterval(() => {
      fetchTables();
      fetchOrders();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchTables = async () => {
    try {
      const response = await axios.get(`${API}/tables?branch_id=${user.branch_id}`, { headers });
      setTables(response.data);
    } catch (error) {
      console.error('Failed to fetch tables:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders?branch_id=${user.branch_id}&order_type=dine_in`, { headers });
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const getTableOrder = (tableId) => {
    return orders.find(order => order.table_id === tableId && !['completed', 'cancelled'].includes(order.status));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="waiter-dashboard">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold" data-testid="waiter-title">Waiter Dashboard</h1>
                <p className="text-sm text-blue-100">{user?.name}</p>
              </div>
            </div>
            <Button variant="outline" className="bg-white text-blue-600 hover:bg-blue-50" onClick={handleLogout} data-testid="logout-button">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Table Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {tables.map(table => {
              const tableOrder = getTableOrder(table.id);
              const tableStatus = table.status || (table.is_occupied ? 'occupied' : 'vacant');
              const statusColors = {
                'vacant': 'bg-green-50 border-green-300',
                'occupied': 'bg-orange-50 border-orange-300',
                'cleaning': 'bg-yellow-50 border-yellow-300'
              };
              const statusBadgeColors = {
                'vacant': 'bg-green-500',
                'occupied': 'bg-orange-500',
                'cleaning': 'bg-yellow-500'
              };
              return (
                <Card
                  key={table.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${statusColors[tableStatus]}`}
                  onClick={() => setSelectedTable(table)}
                  data-testid={`table-card-${table.id}`}
                >
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold mb-2">{table.table_number}</div>
                    <Badge className={statusBadgeColors[tableStatus]} data-testid={`table-status-${table.id}`}>
                      {tableStatus.charAt(0).toUpperCase() + tableStatus.slice(1)}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-2">Capacity: {table.capacity}</p>
                    <p className="text-xs text-gray-500">{table.location}</p>
                    {tableStatus === 'cleaning' && (
                      <Button 
                        size="sm" 
                        className="mt-2 bg-green-500 hover:bg-green-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkTableVacant(table.id);
                        }}
                        data-testid={`mark-vacant-${table.id}`}
                      >
                        Mark Vacant
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Active Orders */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Active Dine-In Orders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.filter(order => !['completed', 'cancelled'].includes(order.status)).map(order => {
              const table = tables.find(t => t.id === order.table_id);
              return (
                <Card key={order.id} className="hover:shadow-lg transition-shadow" data-testid={`order-card-${order.id}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">#{order.order_number}</CardTitle>
                        <p className="text-sm text-gray-600">Table: {table?.table_number}</p>
                      </div>
                      <Badge className={order.status === 'ready' ? 'bg-green-500' : 'bg-yellow-500'} data-testid={`order-status-${order.id}`}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-sm text-gray-600">{order.items.length} items</p>
                      {order.items.map((item, idx) => (
                        <p key={idx} className="text-sm text-gray-700">
                          {item.quantity}x {item.menu_item_name}
                        </p>
                      ))}
                    </div>
                    <div className="border-t pt-3 flex justify-between items-center">
                      <span className="font-bold text-lg">₹{order.total.toFixed(2)}</span>
                      {order.status === 'ready' && (
                        <Badge className="bg-green-600">Ready to Serve!</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {orders.filter(order => !['completed', 'cancelled'].includes(order.status)).length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                <p>No active orders at the moment</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaiterDashboard;