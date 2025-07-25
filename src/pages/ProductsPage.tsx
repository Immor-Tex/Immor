import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Product, ProductCategory, AnimeType } from '../types/product';
import ProductCard from '../components/products/ProductCard';
import { Filter, X } from 'lucide-react';
import SEO from '../components/SEO';

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [selectedSize, setSelectedSize] = useState<string | 'all'>('all');
  const [selectedAnime, setSelectedAnime] = useState<AnimeType | 'all'>('all');

  const categoryParam = searchParams.get('category');
  const searchQuery = searchParams.get('search');

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }
      
      if (selectedSize !== 'all') {
        query = query.contains('sizes', [selectedSize]);
      }
      
      if (selectedCategory === 'anime' && selectedAnime !== 'all') {
        query = query.eq('anime', selectedAnime);
      }
      
      const { data, error } = await query;

      if (error) throw error;
      
      setProducts(data as Product[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedSize, selectedAnime]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Update URL when category changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    
    if (selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    } else {
      params.delete('category');
    }
    
    if (selectedSize !== 'all') {
      params.set('size', selectedSize);
    } else {
      params.delete('size');
    }
    
    if (selectedCategory === 'anime' && selectedAnime !== 'all') {
      params.set('anime', selectedAnime);
    } else {
      params.delete('anime');
    }
    
    setSearchParams(params);
  }, [selectedCategory, selectedSize, selectedAnime, setSearchParams]);

  // Update selected category when URL changes
  useEffect(() => {
    const category = searchParams.get('category') as ProductCategory | null;
    setSelectedCategory(category || 'all');
  }, [searchParams]);

  useEffect(() => {
    const size = searchParams.get('size') as string | null;
    setSelectedSize(size || 'all');
  }, [searchParams]);

  useEffect(() => {
    const anime = searchParams.get('anime') as AnimeType | null;
    setSelectedAnime(anime || 'all');
  }, [searchParams]);

  const toggleSize = (size: string) => {
    setSelectedSize(prev => 
      prev === size ? 'all' : size
    );
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedSize('all');
    setSelectedAnime('all');
  };

  // Get unique sizes for filters
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const filteredProductsMemo = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = !categoryParam || product.category === categoryParam;
      const matchesSearch = !searchQuery || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, categoryParam, searchQuery]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg aspect-[3/4] mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-5 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-error-500 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Products"
        description="Browse our collection of premium streetwear products"
        keywords="streetwear, fashion, clothing, products"
      />
      <div className="container mx-auto px-4 py-12 pt-24">
        <h1 className="font-heading text-4xl font-bold mb-8">
          {selectedCategory === 'all' ? 'All Products' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Collection`}
        </h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <div className="md:hidden mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-center bg-primary-100 py-3 rounded-md text-primary-900 font-medium"
            >
              {showFilters ? <X size={18} className="mr-2" /> : <Filter size={18} className="mr-2" />}
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
          
          {/* Filters Sidebar */}
          <div className={`w-full md:w-1/4 lg:w-1/5 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-primary-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-xl font-semibold">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-accent-600"
                >
                  Clear All
                </button>
              </div>
              
              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Category</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-4 py-2 rounded-md ${
                      selectedCategory === 'all'
                        ? 'bg-accent-100 text-accent-800'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    All Products
                  </button>
                  
                  {/* T-Shirts Section */}
                  <div className="pl-4 space-y-2">
                    <h4 className="font-medium text-gray-700">T-Shirts</h4>
                    <button
                      onClick={() => setSelectedCategory('simple')}
                      className={`w-full text-left px-4 py-2 rounded-md ${
                        selectedCategory === 'simple'
                          ? 'bg-accent-100 text-accent-800'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      Simple
                    </button>
                    <button
                      onClick={() => setSelectedCategory('oversized')}
                      className={`w-full text-left px-4 py-2 rounded-md ${
                        selectedCategory === 'oversized'
                          ? 'bg-accent-100 text-accent-800'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      Oversized
                    </button>
                    <button
                      onClick={() => setSelectedCategory('delave')}
                      className={`w-full text-left px-4 py-2 rounded-md ${
                        selectedCategory === 'delave'
                          ? 'bg-accent-100 text-accent-800'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      Delave
                    </button>
                  </div>

                  {/* Other Categories */}
                  <button
                    onClick={() => setSelectedCategory('sweatshirt')}
                    className={`w-full text-left px-4 py-2 rounded-md ${
                      selectedCategory === 'sweatshirt'
                        ? 'bg-accent-100 text-accent-800'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    Sweatshirts
                  </button>
                  <button
                    onClick={() => setSelectedCategory('hoodie')}
                    className={`w-full text-left px-4 py-2 rounded-md ${
                      selectedCategory === 'hoodie'
                        ? 'bg-accent-100 text-accent-800'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    Hoodies
                  </button>
                  <button
                    onClick={() => setSelectedCategory('tote')}
                    className={`w-full text-left px-4 py-2 rounded-md ${
                      selectedCategory === 'tote'
                        ? 'bg-accent-100 text-accent-800'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    Tote Bags
                  </button>
                  <button
                    onClick={() => setSelectedCategory('anime')}
                    className={`w-full text-left px-4 py-2 rounded-md ${
                      selectedCategory === 'anime'
                        ? 'bg-accent-100 text-accent-800'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    Anime Collection
                  </button>
                </div>
              </div>
              
              {/* Anime Filter - Only show when anime category is selected */}
              {selectedCategory === 'anime' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Anime Series</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedAnime('all')}
                      className={`w-full text-left px-4 py-2 rounded-md ${
                        selectedAnime === 'all'
                          ? 'bg-accent-100 text-accent-800'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      All Anime
                    </button>
                    <button
                      onClick={() => setSelectedAnime('one_piece')}
                      className={`w-full text-left px-4 py-2 rounded-md ${
                        selectedAnime === 'one_piece'
                          ? 'bg-accent-100 text-accent-800'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      One Piece
                    </button>
                    <button
                      onClick={() => setSelectedAnime('hunter_x_hunter')}
                      className={`w-full text-left px-4 py-2 rounded-md ${
                        selectedAnime === 'hunter_x_hunter'
                          ? 'bg-accent-100 text-accent-800'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      Hunter x Hunter
                    </button>
                    <button
                      onClick={() => setSelectedAnime('naruto')}
                      className={`w-full text-left px-4 py-2 rounded-md ${
                        selectedAnime === 'naruto'
                          ? 'bg-accent-100 text-accent-800'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      Naruto
                    </button>
                    <button
                      onClick={() => setSelectedAnime('dragon_ball')}
                      className={`w-full text-left px-4 py-2 rounded-md ${
                        selectedAnime === 'dragon_ball'
                          ? 'bg-accent-100 text-accent-800'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      Dragon Ball
                    </button>
                    <button
                      onClick={() => setSelectedAnime('jujutsu_kaisen')}
                      className={`w-full text-left px-4 py-2 rounded-md ${
                        selectedAnime === 'jujutsu_kaisen'
                          ? 'bg-accent-100 text-accent-800'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      Jujutsu Kaisen
                    </button>
                    <button
                      onClick={() => setSelectedAnime('attack_on_titan')}
                      className={`w-full text-left px-4 py-2 rounded-md ${
                        selectedAnime === 'attack_on_titan'
                          ? 'bg-accent-100 text-accent-800'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      Attack on Titan
                    </button>
                    <button
                      onClick={() => setSelectedAnime('death_note')}
                      className={`w-full text-left px-4 py-2 rounded-md ${
                        selectedAnime === 'death_note'
                          ? 'bg-accent-100 text-accent-800'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      Death Note
                    </button>
                    <button
                      onClick={() => setSelectedAnime('other')}
                      className={`w-full text-left px-4 py-2 rounded-md ${
                        selectedAnime === 'other'
                          ? 'bg-accent-100 text-accent-800'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      Other Anime
                    </button>
                  </div>
                </div>
              )}

              {/* Size Filter */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`px-3 py-1 border rounded-md text-sm ${
                        selectedSize === size
                          ? 'bg-primary-900 text-white border-primary-900'
                          : 'border-primary-300 text-primary-800'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
              {filteredProductsMemo.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductsPage;