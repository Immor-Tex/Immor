import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, clearCart } = useCartStore();
  
  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  
  const openWhatsApp = () => {
    if (items.length === 0) return;
    
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
    const shipping = 0; // Free shipping for all orders
    const total = subtotal + shipping;
    
    let message = `🛒 *NEW ORDER* (${totalItems} items)

`;
    
    items.forEach((item, index) => {
      const itemTotal = (item.product.price * item.quantity).toFixed(2);
      const productLink = `${window.location.origin}/products/${item.product.id}`;
      message += `${index + 1}. ${item.product.name}
   ${item.selectedColor} | ${item.selectedSize} | Qty: ${item.quantity} | ${itemTotal} MAD
   *Link:* ${productLink}

`;
    });
    
    message += `Subtotal: ${subtotal.toFixed(2)} MAD
Shipping: FREE
Total: ${total.toFixed(2)} MAD

Please provide payment details.`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/212682721588?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="container mx-auto px-4 py-12 pt-24">
      <h1 className="font-heading text-3xl font-bold mb-8">Your Cart</h1>
      
      {items.length === 0 ? (
        <motion.div 
          className="text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-6">
            <ShoppingBag size={64} className="text-primary-300" />
          </div>
          <h2 className="text-2xl font-medium mb-4">Your cart is empty</h2>
          <p className="text-primary-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
          <Link 
            to="/products" 
            className="inline-flex items-center bg-primary-900 text-white px-6 py-3 rounded-md font-medium hover:bg-primary-800 transition-colors"
          >
            Continue Shopping
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-primary-200 overflow-hidden">
              <div className="p-6 border-b border-primary-200">
                <div className="flex justify-between items-center">
                  <h2 className="font-heading text-xl font-semibold">
                    Cart Items ({items.reduce((acc, item) => acc + item.quantity, 0)})
                  </h2>
                  <button 
                    onClick={clearCart}
                    className="text-primary-600 hover:text-error-600 text-sm"
                  >
                    Remove All
                  </button>
                </div>
              </div>
              
              <ul>
                {items.map((item, index) => (
                  <motion.li 
                    key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                    className={`p-6 ${index < items.length - 1 ? 'border-b border-primary-200' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* Product Image */}
                      <div className="sm:w-24 h-24 rounded-md overflow-hidden mb-4 sm:mb-0">
                        <img 
                          src={item.product.images[0]} 
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 sm:ml-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between mb-4">
                          <div>
                            <h3 className="font-medium text-lg mb-1">
                              <Link to={`/products/${item.product.id}`} className="hover:text-accent-600">
                                {item.product.name}
                              </Link>
                            </h3>
                            <p className="text-primary-600 text-sm mb-1">
                              Size: {item.selectedSize}, Color: {item.selectedColor}
                            </p>
                            <p className="font-semibold">
                              {item.product.price.toFixed(2)} MAD
                            </p>
                          </div>
                          
                          <div className="flex items-center mt-4 sm:mt-0">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-primary-300 rounded-md">
                              <button
                                onClick={() => updateQuantity(
                                  item.product.id, 
                                  item.selectedSize, 
                                  item.selectedColor, 
                                  Math.max(1, item.quantity - 1)
                                )}
                                className="w-8 h-8 flex items-center justify-center text-primary-900"
                              >
                                -
                              </button>
                              <span className="w-10 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(
                                  item.product.id, 
                                  item.selectedSize, 
                                  item.selectedColor, 
                                  item.quantity + 1
                                )}
                                className="w-8 h-8 flex items-center justify-center text-primary-900"
                              >
                                +
                              </button>
                            </div>
                            
                            {/* Remove Button */}
                            <button
                              onClick={() => removeFromCart(
                                item.product.id, 
                                item.selectedSize, 
                                item.selectedColor
                              )}
                              className="ml-4 text-primary-600 hover:text-error-600"
                              aria-label="Remove item"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                        
                        {/* Item Total */}
                        <div className="text-right">
                          <p className="text-sm text-primary-600">
                            Total: <span className="font-semibold text-primary-900">
                              ${(item.product.price * item.quantity).toFixed(2)} MAD
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-primary-200 p-6 sticky top-24">
              <h2 className="font-heading text-xl font-semibold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-primary-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)} MAD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-600">Shipping</span>
                  <span>FREE</span>
                </div>
                <div className="border-t border-primary-200 pt-4 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold">
                    ${subtotal.toFixed(2)} MAD
                  </span>
                </div>
              </div>
              
              <button
                onClick={openWhatsApp}
                className="w-full bg-accent-500 hover:bg-accent-600 text-white py-3 rounded-md font-medium mb-4 flex items-center justify-center"
              >
                Checkout via WhatsApp <ArrowRight size={18} className="ml-2" />
              </button>
              
              <Link 
                to="/products" 
                className="block w-full text-center text-primary-900 hover:text-accent-600"
              >
                Continue Shopping
              </Link>
              
              <div className="mt-6 text-sm text-primary-600">
                <p className="mb-2">We accept:</p>
                <p>Payment via WhatsApp for secure and convenient transactions.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;