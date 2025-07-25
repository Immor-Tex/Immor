import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types/product';
import { Order, OrderItem } from '../../types/order';

interface CustomerOrderFormProps {
  onSuccess?: () => void;
  initialData?: Order;
}

interface FormData {
  customer_name: string;
  customer_phone: string;
  city: string;
  address: string;
  note: string;
  items: OrderItem[];
}

const CustomerOrderForm = ({ onSuccess, initialData }: CustomerOrderFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    customer_name: initialData?.customer_name || '',
    customer_phone: initialData?.customer_phone || '',
    city: initialData?.shipping_address?.city || '',
    address: initialData?.shipping_address?.address || '',
    note: initialData?.shipping_address?.note || '',
    items: initialData?.items || [
      {
        product_id: '',
        product_name: '',
        quantity: 1,
        price: 0
      }
    ]
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [cities, setCities] = useState<{ id: string, name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCities();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;
      setProducts(data as Product[]);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    }
  };

  const fetchCities = () => {
    fetch('https://api.ozonexpress.ma/cities')
      .then(res => res.json())
      .then(data => {
        const cityArray = Object.values(data.CITIES).map((city: any) => ({
          id: city.ID,
          name: city.NAME
        }));
        setCities(cityArray);
      });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item: OrderItem, i: number) => {
        if (i === index) {
          if (field === 'product_id') {
            const selectedProduct = products.find(p => p.id === value);
            return {
              ...item,
              product_id: value as string,
              product_name: selectedProduct?.name || '',
              price: selectedProduct?.price || 0
            };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { product_id: '', product_name: '', quantity: 1, price: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_: OrderItem, i: number) => i !== index)
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((total: number, item: OrderItem) => total + (item.quantity * item.price), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to create an order');
      }

      if (initialData) {
        // For edits, first restore the old inventory
        const { error: restoreError } = await supabase.rpc('restore_inventory_on_order_deletion', {
          order_items: initialData.items
        });
        if (restoreError) throw restoreError;
      }

      // Then update with new inventory
      const { error: inventoryError } = await supabase.rpc('update_inventory_on_order', {
        order_items: formData.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        }))
      });

      if (inventoryError) throw inventoryError;

      // Generate new order number for new orders
      let orderNumber = initialData?.order_number;
      if (!initialData) {
        const { data: newOrderNumber, error: orderNumberError } = await supabase
          .rpc('generate_order_number');
        if (orderNumberError) throw orderNumberError;
        orderNumber = newOrderNumber;
      }

      const orderData = {
        order_number: orderNumber,
        user_id: user.id,
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        total_amount: calculateTotal(),
        status: initialData?.status || 'pending',
        items: formData.items,
        shipping_address: {
          city: formData.city,
          address: formData.address,
          note: formData.note
        }
      };

      if (initialData) {
        // Update existing order
        const { error } = await supabase
          .from('orders')
          .update(orderData)
          .eq('id', initialData.id);

        if (error) throw error;
      } else {
        // Create new order
        const { error } = await supabase
          .from('orders')
          .insert([orderData]);

        if (error) throw error;
      }

      // Reset form if it's a new order
      if (!initialData) {
        setFormData({
          customer_name: '',
          customer_phone: '',
          city: '',
          address: '',
          note: '',
          items: [{ product_id: '', product_name: '', quantity: 1, price: 0 }]
        });
      }

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-8 bg-gray-50 rounded-2xl shadow-xl border border-gray-100 space-y-8">
      <h2 className="text-3xl font-extrabold text-accent-800 mb-2 border-b-2 border-accent-200 pb-2">
        {initialData ? 'Edit Order' : 'Create New Order'}
      </h2>
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded border border-red-200">
          {error}
        </div>
      )}

      {/* Customer Information */}
      <div>
        <h3 className="text-xl font-semibold text-accent-700 mb-4">Customer Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleInputChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-accent-500 focus:border-accent-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              name="customer_phone"
              value={formData.customer_phone}
              onChange={handleInputChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-accent-500 focus:border-accent-500 transition"
            />
          </div>
        </div>
      </div>

      <hr className="my-6 border-accent-100" />

      {/* Shipping Address */}
      <div>
        <h3 className="text-xl font-semibold text-accent-700 mb-4">Shipping Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <select
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-accent-500 focus:border-accent-500 transition"
            >
              <option value="">Select a city</option>
              {cities.map(city => (
                <option key={city.id} value={city.id}>{city.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-accent-500 focus:border-accent-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <input
              type="text"
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-accent-500 focus:border-accent-500 transition"
            />
          </div>
        </div>
      </div>

      <hr className="my-6 border-accent-100" />

      {/* Order Items */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-accent-700">Order Items</h3>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center px-4 py-2 border border-accent-500 text-sm font-medium rounded-lg text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-accent-500 transition"
          >
            Add Item
          </button>
        </div>
        {formData.items.map((item, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg mb-4 bg-white shadow-sm">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
              <select
                value={item.product_id}
                onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-accent-500 focus:border-accent-500 transition"
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {product.price.toFixed(2)} MAD
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-accent-500 focus:border-accent-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={item.price}
                readOnly
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 shadow-sm"
              />
            </div>
            {formData.items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="md:col-span-4 mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Remove Item
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Order Total */}
      <div className="border-t pt-6 flex justify-end">
        <p className="text-2xl font-bold text-accent-800">
          Total: {calculateTotal().toFixed(2)} MAD
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end mt-8">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-semibold rounded-lg text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:opacity-50 transition"
        >
          {isSubmitting ? (initialData ? 'Updating Order...' : 'Creating Order...') : (initialData ? 'Update Order' : 'Create Order')}
        </button>
      </div>
    </form>
  );
};

export default CustomerOrderForm; 