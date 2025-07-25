import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Product } from '../types/product';
import { useCartStore } from '../store/cartStore';
import { ArrowLeft, ShoppingBag, Check, ChevronRight, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  
  const addToCart = useCartStore((state) => state.addToCart);

  // Get current images based on selected color
  const currentImages = useMemo(() => {
    if (product?.color_images && selectedColor && product.color_images[selectedColor]) {
      return product.color_images[selectedColor];
    }
    return product?.images || [];
  }, [product, selectedColor]);

  useEffect(() => {
    // Reset active image when color changes
    setActiveImage(0);
  }, [selectedColor]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setProduct(data as Product);
        
        // Initialize selected options with first available
        if (data) {
          setSelectedSize(data.sizes[0] || '');
          setSelectedColor(data.colors[0] || '');
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        // For demo purposes, set dummy data
        const dummyProduct: Product = {
          id: id || '1',
          name: 'Oversized Statement Tee',
          description: 'Our signature oversized tee features a relaxed fit with dropped shoulders and an extended hem. Made from premium heavyweight cotton for exceptional durability and shape retention. The minimalist design is elevated with subtle branding and a clean aesthetic that pairs with everything in your wardrobe. Perfect for layering or wearing on its own.',
          price: 159,
          category: 'oversized',
          sizes: ['S', 'M', 'L', 'XL'],
          colors: ['Black', 'White', 'Grey'],
          images: [
            'https://images.pexels.com/photos/5698851/pexels-photo-5698851.jpeg',
            'https://images.pexels.com/photos/5698850/pexels-photo-5698850.jpeg',
            'https://images.pexels.com/photos/5698843/pexels-photo-5698843.jpeg'
          ],
          stock: 15,
          featured: true,
          color_images: {}
        };
        
        setProduct(dummyProduct);
        setSelectedSize(dummyProduct.sizes[0] || '');
        setSelectedColor(dummyProduct.colors[0] || '');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product && selectedSize && selectedColor) {
      addToCart({
        product,
        quantity,
        selectedSize,
        selectedColor
      });
      
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    }
  };

  const openWhatsApp = () => {
    if (product && selectedSize && selectedColor) {
      const totalPrice = (product.price * quantity).toFixed(2);
      const productLink = `${window.location.origin}/products/${product.id}`;
      const message = `🛒 *NEW ORDER*

${product.name}
${selectedColor} | Size: ${selectedSize} | Qty: ${quantity}
${totalPrice} MAD

*Product Link:*
${productLink}

Please provide payment details.`;
      
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/212682721588?text=${encodedMessage}`, '_blank');
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 pt-24">
        <div className="animate-pulse">
          <div className="h-8 bg-primary-100 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-primary-100 rounded-lg aspect-square"></div>
            <div className="space-y-4">
              <div className="h-8 bg-primary-100 rounded w-3/4"></div>
              <div className="h-6 bg-primary-100 rounded w-1/4"></div>
              <div className="h-4 bg-primary-100 rounded w-full mt-8"></div>
              <div className="h-4 bg-primary-100 rounded w-full"></div>
              <div className="h-4 bg-primary-100 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 pt-24 text-center">
        <h1 className="font-heading text-3xl font-bold mb-4">Product Not Found</h1>
        <p className="text-primary-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <Link 
          to="/products" 
          className="inline-flex items-center bg-primary-900 text-white px-6 py-3 rounded-md font-medium hover:bg-primary-800 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" /> Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 pt-24">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-primary-600 mb-8">
        <Link to="/" className="hover:text-primary-900">Home</Link>
        <ChevronRight size={16} className="mx-2" />
        <Link to="/products" className="hover:text-primary-900">Products</Link>
        <ChevronRight size={16} className="mx-2" />
        <Link to={`/products?category=${product.category}`} className="hover:text-primary-900">
          {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
        </Link>
        <ChevronRight size={16} className="mx-2" />
        <span className="text-primary-900 font-medium">{product.name}</span>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div>
          <div className="mb-4 aspect-square overflow-hidden rounded-lg">
            <motion.img 
              key={activeImage}
              src={currentImages[activeImage] || 'https://images.pexels.com/photos/5698851/pexels-photo-5698851.jpeg'} 
              alt={product.name}
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex gap-1">
            {product.colors.flatMap((color) => 
              (product.color_images[color] || product.images).map((image, index) => (
                <button
                  key={`${color}-${index}`}
                  onClick={() => {
                    setSelectedColor(color);
                    setActiveImage(index);
                  }}
                  className={`flex-1 aspect-square rounded-md overflow-hidden border-2 ${
                    selectedColor === color && activeImage === index 
                      ? 'border-accent-500' 
                      : 'border-transparent'
                  }`}
                >
                  <img 
                    src={image} 
                    alt={`${product.name} ${color} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))
            )}
          </div>
        </div>
        
        {/* Product Details */}
        <div>
          <h1 className="font-heading text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-2xl font-semibold mb-6">{product.price.toFixed(2)} MAD</p>
          
          {/* Stock Status */}
          <div className="mb-6">
            {product.stock > 10 ? (
              <p className="text-success-600 flex items-center">
                <Check size={18} className="mr-2" /> In Stock
              </p>
            ) : product.stock > 0 ? (
              <p className="text-warning-600">Only {product.stock} left in stock</p>
            ) : (
              <p className="text-error-600">Out of Stock</p>
            )}
          </div>
          
          <div className="border-t border-primary-200 my-6 pt-6">
            <p className="text-primary-700 mb-6 leading-relaxed">
              {product.description}
            </p>
            
            {/* Size Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-primary-900 mb-2">
                Size
              </label>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded-md ${
                      selectedSize === size
                        ? 'bg-primary-900 text-white border-primary-900'
                        : 'border-primary-300 text-primary-800 hover:border-primary-900'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Color Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-primary-900 mb-2">
                Color
              </label>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`flex flex-col items-center ${
                      selectedColor === color ? 'text-primary-900' : 'text-primary-600'
                    }`}
                  >
                    <span 
                      className={`w-8 h-8 rounded-full mb-1 border ${
                        selectedColor === color ? 'border-primary-900 ring-2 ring-primary-300' : 'border-primary-300'
                      }`}
                      style={{ backgroundColor: color.toLowerCase().replace(' ', '') }}
                    ></span>
                    <span className="text-xs">{color}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Quantity */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-primary-900 mb-2">
                Quantity
              </label>
              <div className="flex items-center w-32">
                <button
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center border border-primary-300 rounded-l-md text-primary-900 disabled:text-primary-400"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(parseInt(e.target.value) || 1, product.stock))}
                  className="w-12 h-10 border-t border-b border-primary-300 text-center focus:outline-none"
                />
                <button
                  onClick={incrementQuantity}
                  disabled={quantity >= product.stock}
                  className="w-10 h-10 flex items-center justify-center border border-primary-300 rounded-r-md text-primary-900 disabled:text-primary-400"
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={openWhatsApp}
                disabled={product.stock === 0 || !selectedSize || !selectedColor}
                className="flex-1 bg-accent-500 hover:bg-accent-600 text-white px-6 py-3 rounded-md font-medium flex items-center justify-center disabled:bg-primary-300"
              >
                Buy via WhatsApp
              </button>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || !selectedSize || !selectedColor}
                className="flex-1 bg-primary-900 hover:bg-primary-800 text-white px-6 py-3 rounded-md font-medium flex items-center justify-center disabled:bg-primary-300"
              >
                {addedToCart ? (
                  <>
                    <Check size={20} className="mr-2" /> Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag size={20} className="mr-2" /> Add to Cart
                  </>
                )}
              </button>
            </div>
            
            {/* Share */}
            <div className="mt-8 flex items-center">
              <button className="text-primary-600 hover:text-primary-900 flex items-center">
                <Share2 size={18} className="mr-2" /> Share
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional Information */}
      <div className="mt-16 border-t border-primary-200 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Shipping */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-3">Shipping</h3>
            <p className="text-primary-700 mb-2">Free shipping on all orders over $75</p>
            <p className="text-primary-700">Standard delivery: 3-5 business days</p>
          </div>
          
          {/* Returns */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-3">Returns</h3>
            <p className="text-primary-700 mb-2">Free returns within 30 days</p>
            <p className="text-primary-700">See our full return policy for details</p>
          </div>
          
          {/* Care */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-3">Care Instructions</h3>
            <p className="text-primary-700 mb-2">Machine wash cold with similar colors</p>
            <p className="text-primary-700">Tumble dry low</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;