import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product } from '../types/product';
import ProductCard from '../components/products/ProductCard';
import SEO from '../components/SEO';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('featured', true)
          .limit(4);

        if (error) throw error;
        setFeaturedProducts(data as Product[]);
      } catch (error) {
        console.error('Error fetching featured products:', error);
        // For demo purposes, set dummy data
        setFeaturedProducts([
          {
            id: '1',
            name: 'Oversized Statement Tee',
            description: 'Relaxed fit with bold graphic prints',
            price: 159,
            category: 'oversized',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['Black', 'White', 'Grey'],
            images: ['https://images.pexels.com/photos/5698851/pexels-photo-5698851.jpeg'],
            stock: 15,
            featured: true,
            color_images: {}
          },
          {
            id: '2',
            name: 'Urban Jersey',
            description: 'Athletic-inspired design with modern street style',
            price: 159,
            category: 'sweatshirt',
            sizes: ['M', 'L', 'XL'],
            colors: ['Black', 'Navy', 'Red'],
            images: ['https://images.pexels.com/photos/5705506/pexels-photo-5705506.jpeg'],
            stock: 12,
            featured: true,
            color_images: {}
          },
          {
            id: '3',
            name: 'Vintage Wash Tee',
            description: 'Soft, pre-washed fabric for ultimate comfort',
            price: 159,
            category: 'delave',
            sizes: ['S', 'M', 'L'],
            colors: ['Faded Black', 'Washed Blue', 'Vintage Red'],
            images: ['https://images.pexels.com/photos/6347546/pexels-photo-6347546.jpeg'],
            stock: 20,
            featured: true,
            color_images: {}
          },
          {
            id: '4',
            name: 'Signature Oversized Hoodie',
            description: 'Our flagship oversized hoodie with minimalist design',
            price: 159,
            category: 'oversized',
            sizes: ['M', 'L', 'XL', 'XXL'],
            colors: ['Black', 'Grey', 'Olive'],
            images: ['https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg'],
            stock: 8,
            featured: true,
            color_images: {}
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div>
      <SEO 
        title="Home"
        description="IMMORTEX - Premium streetwear for those who stand out. Explore our latest collection of oversized t-shirts, jerseys, and delave t-shirts."
        keywords="streetwear, fashion, t-shirts, jerseys, oversized, delave, premium clothing"
      />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.pexels.com/photos/14146828/pexels-photo-14146828.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
            alt="IMMORTEX fashion collection" 
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20"></div>
        </div>
        
        <div className="container mx-auto px-4 z-10 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-xl"
          >
            <h1 className="font-heading text-5xl md:text-6xl font-bold mb-4">
              Define Your Style, Defy The Ordinary
            </h1>
            <p className="text-xl mb-8">
              Premium streetwear for those who stand out. Explore our latest collection.
            </p>
            <Link 
              to="/products" 
              className="inline-flex items-center bg-white text-primary-900 px-6 py-3 rounded-md font-medium hover:bg-accent-500 hover:text-white transition-colors duration-300"
            >
              Shop Now <ArrowRight size={20} className="ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-primary-50">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-12 text-center">Our Collections</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Oversized */}
            <Link 
              to="/products?category=oversized" 
              className="group relative h-96 overflow-hidden rounded-lg"> 
              <img 
                src="https://mansrxulzzgzfvnhrkuw.supabase.co/storage/v1/object/public/product-images//1-%20.webp" 
                alt="Oversized T-Shirts Collection" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                width="400"
                height="600"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                <div>
                  <h3 className="text-white font-heading text-2xl font-semibold mb-2">Oversized T-Shirts</h3>
                  <p className="text-primary-200">Bold statements, relaxed fits</p>
                </div>
              </div>
            </Link>
            
            {/* Jerseys */}
            <Link 
              to="/products?category=jersey" 
              className="group relative h-96 overflow-hidden rounded-lg"
            >
              <img 
                src="https://mansrxulzzgzfvnhrkuw.supabase.co/storage/v1/object/public/product-images//21.webp" 
                alt="Jerseys Collection" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                width="400"
                height="600"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                <div>
                  <h3 className="text-white font-heading text-2xl font-semibold mb-2">Jerseys</h3>
                  <p className="text-primary-200">Athletic-inspired street style</p>
                </div>
              </div>
            </Link> 
            
            {/* Delave */}
            <Link 
              to="/products?category=delave" 
              className="group relative h-96 overflow-hidden rounded-lg"
            >
              <img 
                src="https://mansrxulzzgzfvnhrkuw.supabase.co/storage/v1/object/public/product-images//6.webp" 
                alt="Delave T-Shirts Collection" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                width="400"
                height="600"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                <div>
                  <h3 className="text-white font-heading text-2xl font-semibold mb-2">Delave T-Shirts</h3>
                  <p className="text-primary-200">Vintage-washed comfort</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold">Featured Products</h2>
            <Link 
              to="/products" 
              className="text-primary-900 font-medium hover:text-accent-600 inline-flex items-center"
            >
              View All <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-primary-100 rounded-lg h-96 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Brand Section */}
      <section className="py-20 bg-primary-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">About IMMORTEX</h2>
              <p className="text-primary-300 mb-6">
                Born from a passion for authentic streetwear, IMMORTEX blends bold design with premium quality. 
                Our collections are crafted for those who appreciate the art of standing out while maintaining 
                a refined aesthetic.
              </p>
              <p className="text-primary-300 mb-8">
                Each piece in our collection tells a story of urban culture, artistic expression, and 
                meticulous attention to detail. We're not just selling clothes; we're creating a lifestyle.
              </p>
              <Link 
                to="/about" 
                className="inline-flex items-center bg-white text-primary-900 px-6 py-3 rounded-md font-medium hover:bg-accent-500 hover:text-white transition-colors duration-300"
              >
                Learn More <ArrowRight size={20} className="ml-2" />
              </Link>
            </div>
            <div className="relative h-[500px]">
              <img 
                src="https://images.pexels.com/photos/2466756/pexels-photo-2466756.jpeg" 
                alt="About IMMORTEX" 
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Gallery */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6 text-center">Follow Our Journey</h2>
          <p className="text-primary-600 text-center mb-12 max-w-2xl mx-auto">
            Join our community and share your IMMORTEX style with #WEARIMMORTAL
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'https://mansrxulzzgzfvnhrkuw.supabase.co/storage/v1/object/public/product-images//3.webp',
              'https://mansrxulzzgzfvnhrkuw.supabase.co/storage/v1/object/public/product-images//1-%20.webp',
              'https://mansrxulzzgzfvnhrkuw.supabase.co/storage/v1/object/public/product-images//1.webp',
              'https://mansrxulzzgzfvnhrkuw.supabase.co/storage/v1/object/public/product-images//6.webp',
              'https://mansrxulzzgzfvnhrkuw.supabase.co/storage/v1/object/public/product-images//4.webp',
              'https://mansrxulzzgzfvnhrkuw.supabase.co/storage/v1/object/public/product-images//2-.webp',
              'https://mansrxulzzgzfvnhrkuw.supabase.co/storage/v1/object/public/product-images//21.webp',
              'https://mansrxulzzgzfvnhrkuw.supabase.co/storage/v1/object/public/product-images//7.webp'
            ].map((image, index) => (
              <div key={index} className="aspect-square overflow-hidden rounded-md">
                <img 
                  src={image} 
                  alt={`IMMORTEX Instagram post ${index + 1}`} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  width="300"
                  height="300"
                />
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <a 
              href="https://www.instagram.com/immor.tex/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-primary-900 font-medium hover:text-accent-600"
            >
              @IMMORTEX <ArrowRight size={18} className="ml-2" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;