import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types/product';
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign,
  Package,
  AlertTriangle
} from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      const admin = localStorage.getItem('immortex_admin');
      if (!admin) {
        navigate('/admin/login');
      } else {
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchData = async () => {
        try {
          // Fetch products from Supabase
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('*');

          if (productsError) throw productsError;
          
          setProducts(productsData as Product[]);
          setLowStockProducts((productsData as Product[]).filter(p => p.stock < 10 && p.stock > 0));

          // Fetch recent orders
          const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

          if (ordersError) throw ordersError;
          setOrders(ordersData as Order[]);

        } catch (error) {
          console.error('Error fetching data:', error);
          setProducts([]);
          setLowStockProducts([]);
          setOrders([]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  const calculateTotalRevenue = () => {
    return orders
      .filter(order => order.status !== 'cancelled')
      .reduce((total, order) => total + order.total_amount, 0);
  };

  const calculateTotalOrders = () => {
    return orders.filter(order => order.status !== 'cancelled').length;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout title="Dashboard">
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm animate-pulse h-32"></div>
          ))}
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-primary-600 text-sm">Total Revenue</p>
                  <p className="text-2xl font-semibold mt-1">{calculateTotalRevenue().toLocaleString()} MAD</p>
                  <p className="text-success-600 text-sm mt-2 flex items-center">
                    <TrendingUp size={16} className="mr-1" /> From {calculateTotalOrders()} orders
                  </p>
                </div>
                <div className="p-3 rounded-full bg-primary-100">
                  <DollarSign size={24} className="text-primary-800" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-primary-600 text-sm">Total Orders</p>
                  <p className="text-2xl font-semibold mt-1">{calculateTotalOrders()}</p>
                  <p className="text-success-600 text-sm mt-2 flex items-center">
                    <TrendingUp size={16} className="mr-1" /> Active orders
                  </p>
                </div>
                <div className="p-3 rounded-full bg-primary-100">
                  <ShoppingBag size={24} className="text-primary-800" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-primary-600 text-sm">Total Products</p>
                  <p className="text-2xl font-semibold mt-1">{products.length}</p>
                  <p className="text-success-600 text-sm mt-2 flex items-center">
                    <TrendingUp size={16} className="mr-1" /> In inventory
                  </p>
                </div>
                <div className="p-3 rounded-full bg-primary-100">
                  <Package size={24} className="text-primary-800" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-primary-600 text-sm">Low Stock Alert</p>
                  <p className="text-2xl font-semibold mt-1">{lowStockProducts.length}</p>
                  <p className="text-warning-600 text-sm mt-2 flex items-center">
                    <AlertTriangle size={16} className="mr-1" /> Products need attention
                  </p>
                </div>
                <div className="p-3 rounded-full bg-primary-100">
                  <AlertTriangle size={24} className="text-primary-800" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Orders */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Recent Orders</h2>
                <Link to="/admin/orders" className="text-accent-600 hover:text-accent-700 text-sm">
                  View All
                </Link>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-primary-200">
                      <th className="py-3 text-left text-sm font-medium text-primary-600">Order ID</th>
                      <th className="py-3 text-left text-sm font-medium text-primary-600">Customer</th>
                      <th className="py-3 text-left text-sm font-medium text-primary-600">Date</th>
                      <th className="py-3 text-right text-sm font-medium text-primary-600">Amount</th>
                      <th className="py-3 text-right text-sm font-medium text-primary-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-sm text-gray-500">
                          No orders found
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order.id} className="border-b border-primary-200 hover:bg-primary-50">
                          <td className="py-4 text-sm font-medium text-primary-900">
                            #{order.order_number}
                          </td>
                          <td className="py-4 text-sm text-primary-800">{order.customer_name}</td>
                          <td className="py-4 text-sm text-primary-800">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.total_amount.toFixed(2)} MAD
                          </td>
                          <td className="py-4 text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Low Stock Products */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Low Stock Products</h2>
                <Link to="/admin/products" className="text-accent-600 hover:text-accent-700 text-sm">
                  View All
                </Link>
              </div>
              
              {lowStockProducts.length > 0 ? (
                <div className="space-y-4">
                  {lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center p-3 border border-primary-200 rounded-md hover:bg-primary-50">
                      <div className="w-12 h-12 rounded-md overflow-hidden">
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-sm font-medium text-primary-900">{product.name}</h3>
                        <p className="text-xs text-primary-600">
                          {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-600`}>
                          {product.stock} left
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-primary-600">No low stock products</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;