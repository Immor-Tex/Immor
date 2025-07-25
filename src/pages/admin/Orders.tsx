import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import CustomerOrderForm from '../../components/orders/CustomerOrderForm';
import { supabase } from '../../lib/supabase';
import { 
  Search, 
  ChevronDown, 
  Eye, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  User,
  MapPin
} from 'lucide-react';
import { Order } from '../../types/order';

interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

async function sendOrderToOzonExpress(order: Order) {
  const OZON_API_KEY = import.meta.env.VITE_OZON_API_KEY;
  const OZON_CLIENT_ID = import.meta.env.VITE_OZON_CLIENT_ID;
  const formData = new FormData();
  formData.append('parcel-receiver', order.customer_name);
  formData.append('parcel-phone', order.customer_phone || '');
  formData.append('parcel-city', order.shipping_address.city);
  formData.append('parcel-address', order.shipping_address.address || '');
  formData.append('parcel-note', order.shipping_address.note || '');
  formData.append('parcel-price', order.total_amount.toString());
  formData.append('parcel-nature', order.items.map((item: OrderItem) => item.product_name).join(', '));
  formData.append('parcel-stock', '0');
  formData.append('tracking-number', order.order_number);
  formData.append('products', JSON.stringify(order.items.map((item: OrderItem) => ({
    ref: item.product_id,
    qnty: item.quantity
  }))));
  const url = `https://api.ozonexpress.ma/customers/${OZON_CLIENT_ID}/${OZON_API_KEY}/add-parcel`;
  const response = await fetch(url, {
    method: 'POST',
    body: formData
  });
  if (!response.ok) {
    throw new Error('Failed to send order to OzonExpress');
  }
  return response.json();
}

const Orders = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showNewOrderForm, setShowNewOrderForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setOrders(data as Order[]);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) throw new Error('Order not found');

      // If changing to cancelled, restore inventory
      if (newStatus === 'cancelled' && order.status !== 'cancelled') {
        const { error: inventoryError } = await supabase.rpc('restore_inventory_on_order_deletion', {
          order_items: order.items
        });
        if (inventoryError) throw inventoryError;
      }
      // If changing from cancelled to another status, update inventory
      else if (order.status === 'cancelled' && newStatus !== 'cancelled') {
        const { error: inventoryError } = await supabase.rpc('update_inventory_on_order', {
          order_items: order.items
        });
        if (inventoryError) throw inventoryError;
      }

      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // If status is set to processing, send to OzonExpress
      if (newStatus === 'processing') {
        try {
          const shipping_address = {
            city: order.shipping_address.city,
            address: (order.shipping_address as any).address || '',
            note: (order.shipping_address as any).note || ''
          };
          console.log('Sending to OzonExpress:', { ...order, shipping_address });
          const result = await sendOrderToOzonExpress({ ...order, shipping_address });
          console.log('OzonExpress response:', result);
        } catch (err) {
          console.error('Failed to send order to OzonExpress:', err);
        }
      }

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));

      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status: Order['status']) => {
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

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Package className="w-5 h-5" />;
      case 'processing':
        return <RefreshCw className="w-5 h-5" />;
      case 'shipped':
        return <Truck className="w-5 h-5" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleNewOrderSuccess = () => {
    setShowNewOrderForm(false);
    fetchOrders(); // Refresh the orders list
  };

  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setIsEditing(true);
  };

  const handleDelete = async (orderId: string) => {
    try {
      // First restore inventory
      const { error: inventoryError } = await supabase.rpc('restore_inventory_on_order_deletion', {
        order_items: selectedOrder?.items
      });

      if (inventoryError) throw inventoryError;

      // Then delete the order
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(orders.filter(order => order.id !== orderId));
      setShowDeleteConfirm(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AdminLayout title="Orders">
      <div className="space-y-6">
        {/* Header with New Order Button */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          <button
            onClick={() => setShowNewOrderForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-accent-600 hover:bg-accent-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Order
          </button>
        </div>

        {/* New Order Form Modal */}
        {showNewOrderForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Create New Order</h2>
                  <button
                    onClick={() => setShowNewOrderForm(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                <CustomerOrderForm onSuccess={handleNewOrderSuccess} />
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-accent-500 focus:border-accent-500"
              />
            </div>
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:ring-accent-500 focus:border-accent-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    City
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product(s)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-4 text-center text-gray-500">
                      Loading orders...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-4 text-center text-gray-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className={
                        `hover:bg-gray-100 ` +
                        (order.status === 'pending' ? 'bg-yellow-200 border-l-4 border-yellow-500' : '') +
                        (order.status === 'processing' ? 'bg-blue-200 border-l-4 border-blue-500' : '') +
                        (order.status === 'shipped' ? 'bg-purple-200 border-l-4 border-purple-500' : '') +
                        (order.status === 'delivered' ? 'bg-green-200 border-l-4 border-green-500' : '') +
                        (order.status === 'cancelled' ? 'bg-red-200 border-l-4 border-red-500' : '')
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{order.order_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer_phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.shipping_address.city}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.shipping_address.note || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.items.map(item => item.product_name).join(', ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.items.map(item => item.price.toFixed(2)).join(', ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.items.map(item => item.quantity).join(', ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.total_amount.toFixed(2)} MAD</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-accent-600 hover:text-accent-900"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(order)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDeleteConfirm(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && !isEditing && !showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-accent-50 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-accent-100">
            {/* Header */}
            <div className="flex justify-between items-center px-8 pt-8 pb-4 bg-accent-100 rounded-t-2xl border-b-2 border-accent-200">
              <div>
                <h2 className="text-2xl font-extrabold text-accent-800">
                  Order #{selectedOrder.order_number}
                </h2>
                <p className="text-sm text-accent-600 mt-1">
                  {new Date(selectedOrder.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircle className="w-7 h-7" />
              </button>
            </div>

            <div className="space-y-8 px-8 py-8">
              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-semibold text-accent-700 mb-2 flex items-center">
                  <User className="w-5 h-5 mr-2 text-accent-600" /> Customer Information
                </h3>
                <div className="bg-white rounded-lg p-4 shadow border border-gray-100 flex flex-col gap-1">
                  <span className="text-base font-medium text-gray-900">{selectedOrder.customer_name}</span>
                  <span className="text-sm text-gray-500">{selectedOrder.customer_phone}</span>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="text-lg font-semibold text-accent-700 mb-2 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-accent-600" /> Shipping Address
                </h3>
                <div className="bg-white rounded-lg p-4 shadow border border-gray-100 flex flex-col gap-1">
                  <span className="text-base text-gray-900">City: <span className="font-medium">{selectedOrder.shipping_address.city}</span></span>
                  <span className="text-base text-gray-900">Address: <span className="font-medium">{selectedOrder.shipping_address.address}</span></span>
                  {selectedOrder.shipping_address.note && (
                    <span className="text-base text-gray-900">Note: <span className="font-medium">{selectedOrder.shipping_address.note}</span></span>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold text-accent-700 mb-2 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-accent-600" /> Order Items
                </h3>
                <div className="bg-white rounded-lg divide-y divide-gray-200 shadow border border-gray-100">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="p-4 flex justify-between items-center">
                      <div>
                        <p className="text-base font-medium text-gray-900">{item.product_name}</p>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <p className="text-base text-gray-700">
                        Price: {item.price.toFixed(2)} MAD x {item.quantity} = <span className="font-semibold">{(item.price * item.quantity).toFixed(2)} MAD</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total */}
              <div className="flex justify-between items-center pt-4 border-t border-accent-100">
                <span className="text-lg font-semibold text-accent-800">Total</span>
                <span className="text-2xl font-extrabold text-accent-800">
                  {selectedOrder.total_amount.toFixed(2)} MAD
                </span>
              </div>

              {/* Order Status */}
              <div className="mt-8 p-6 rounded-xl border-2 border-accent-200 bg-accent-50 shadow-lg transition">
                <h3 className="text-lg font-semibold text-accent-800 mb-4 flex items-center">
                  <RefreshCw className="w-5 h-5 mr-2 text-accent-600" />
                  Update Status
                </h3>
                <div className="flex flex-wrap gap-3">
                  {(['pending', 'processing', 'shipped', 'delivered'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => updateOrderStatus(selectedOrder.id, status)}
                      className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm border transition
                        ${selectedOrder.status === status
                          ? 'bg-accent-600 text-white border-accent-600'
                          : 'bg-white text-gray-800 border-gray-200 hover:bg-accent-100 hover:border-accent-300'}
                      `}
                      title={
                        status === 'pending' ? 'Order is waiting to be processed' :
                        status === 'processing' ? 'Order is being prepared for shipping' :
                        status === 'shipped' ? 'Order is on the way' :
                        status === 'delivered' ? 'Order delivered to customer' : ''
                      }
                    >
                      {status === 'pending' && <Package className="w-4 h-4" />}
                      {status === 'processing' && <RefreshCw className="w-4 h-4" />}
                      {status === 'shipped' && <Truck className="w-4 h-4" />}
                      {status === 'delivered' && <CheckCircle className="w-4 h-4" />}
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                      {selectedOrder.status === status && (
                        <CheckCircle className="w-3 h-3 ml-1 text-white" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 mt-3">
                  <button
                    key="cancelled"
                    onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                    className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm border transition
                      ${selectedOrder.status === 'cancelled'
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-white text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300'}
                    `}
                    title="Order was cancelled"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancelled
                    {selectedOrder.status === 'cancelled' && (
                      <CheckCircle className="w-3 h-3 ml-1 text-white" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {selectedOrder && isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Decorated header */}
            <div className="flex justify-between items-center mb-0 border-b-2 border-accent-200 p-6 bg-accent-50 rounded-t-lg shadow">
              <h2 className="text-2xl font-bold text-accent-800">Edit Order</h2>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedOrder(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            {/* Form area with soft background */}
            <div className="p-6 bg-gray-50 rounded-b-lg">
              <CustomerOrderForm 
                initialData={selectedOrder}
                onSuccess={() => {
                  setIsEditing(false);
                  setSelectedOrder(null);
                  fetchOrders();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Delete Order</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete order #{selectedOrder.order_number}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedOrder(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(selectedOrder.id)}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Orders; 