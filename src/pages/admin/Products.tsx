import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { Product, ProductCategory, AnimeType } from '../../types/product';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Check as CheckIcon, 
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const AdminProducts = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'all'>('all');
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  
  const navigate = useNavigate();
  
  // New product form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'simple' as ProductCategory,
    anime: 'one_piece' as AnimeType,
    sizes: [] as string[],
    colors: [] as string[],
    stock: 0,
    featured: false,
    images: [] as string[],
    color_images: {} as { [key: string]: string[] }
  });

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
      fetchProducts();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Apply filters
    let results = [...products];
    
    if (search.trim()) {
      results = results.filter(product => 
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (categoryFilter !== 'all') {
      results = results.filter(product => product.category === categoryFilter);
    }
    
    setFilteredProducts(results);
    setPage(1); // Reset to first page when filters change
  }, [search, categoryFilter, products]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      // Fetch products from Supabase
      const { data, error } = await supabase.from('products').select('*');

      if (error) throw error;
      
      setProducts(data as Product[]);
      setFilteredProducts(data as Product[]);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Pagination
  const pageCount = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleOpenEditModal = (product: Product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      anime: product.anime || 'one_piece',
      sizes: [...product.sizes],
      colors: [...product.colors],
      stock: product.stock,
      featured: product.featured,
      images: [...product.images],
      color_images: product.color_images || {}
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (product: Product) => {
    setCurrentProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: 'simple',
      anime: 'one_piece',
      sizes: [],
      colors: [],
      stock: 0,
      featured: false,
      images: [],
      color_images: {}
    });
    setIsAddModalOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSizesChange = (size: string) => {
    setFormData(prev => {
      if (prev.sizes.includes(size)) {
        return { ...prev, sizes: prev.sizes.filter(s => s !== size) };
      } else {
        return { ...prev, sizes: [...prev.sizes, size] };
      }
    });
  };

  const handleColorsChange = (color: string) => {
    setFormData(prev => {
      if (prev.colors.includes(color)) {
        return { ...prev, colors: prev.colors.filter(c => c !== color) };
      } else {
        return { ...prev, colors: [...prev.colors, color] };
      }
    });
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleColorImagesChange = (color: string, images: string[]) => {
    setFormData(prev => ({
      ...prev,
      color_images: {
        ...prev.color_images,
        [color]: images
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock)
      };

      if (currentProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', currentProduct.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
      }

      setFormData({
        name: '',
        description: '',
        price: 0,
        category: 'simple',
        anime: 'one_piece',
        sizes: [],
        colors: [],
        stock: 0,
        featured: false,
        images: [],
        color_images: {}
      });
      setCurrentProduct(null);
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDeleteProduct = async () => {
    try {
      if (!currentProduct) return;
      
      // Delete from Supabase
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', currentProduct.id);

      if (error) throw error;
      
      // Update local state
      setProducts(prev => prev.filter(p => p.id !== currentProduct.id));
      
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <AdminLayout title="Products">
      {/* Toolbar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 md:w-80">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-primary-300 rounded-md focus:ring-accent-500 focus:border-accent-500"
              />
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400" />
            </div>
            
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as ProductCategory | 'all')}
                className="pl-10 pr-4 py-2 border border-primary-300 rounded-md focus:ring-accent-500 focus:border-accent-500 appearance-none"
              >
                <option value="all">All Categories</option>
                <option value="simple">Simple T-Shirt</option>
                <option value="oversized">Oversized T-Shirt</option>
                <option value="delave">Delave T-Shirt</option>
                <option value="sweatshirt">Sweatshirt</option>
                <option value="hoodie">Hoodie</option>
                <option value="tote">Tote Bag</option>
                <option value="anime">Anime T-Shirt</option>
              </select>
              <Filter size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400" />
            </div>
          </div>
          
          <button
            onClick={handleOpenAddModal}
            className="bg-primary-900 text-white px-4 py-2 rounded-md hover:bg-primary-800 transition-colors flex items-center"
          >
            <Plus size={20} className="mr-2" /> Add Product
          </button>
        </div>
      </div>
      
      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-primary-100 rounded w-full"></div>
              <div className="h-8 bg-primary-100 rounded w-full"></div>
              <div className="h-8 bg-primary-100 rounded w-full"></div>
              <div className="h-8 bg-primary-100 rounded w-full"></div>
              <div className="h-8 bg-primary-100 rounded w-full"></div>
            </div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-primary-200">
                <thead className="bg-primary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-600 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-600 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-600 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-600 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary-600 uppercase tracking-wider">Featured</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-primary-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-primary-200">
                  {paginatedProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-primary-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img 
                              className="h-10 w-10 rounded-md object-cover" 
                              src={product.images[0] || 'https://via.placeholder.com/40'} 
                              alt={product.name} 
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-primary-900">{product.name}</div>
                            <div className="text-sm text-primary-600 truncate max-w-xs">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                          {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.price.toFixed(2)} MAD
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.stock > 10
                            ? 'bg-success-100 text-success-800'
                            : product.stock > 0
                            ? 'bg-warning-100 text-warning-800'
                            : 'bg-error-100 text-error-800'
                        }`}>
                          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-900">
                        {product.featured ? 
                          <CheckIcon size={20} className="text-success-600" /> : 
                          <X size={20} className="text-primary-400" />
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleOpenEditModal(product)}
                          className="text-accent-600 hover:text-accent-800 mr-3"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(product)}
                          className="text-error-600 hover:text-error-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {pageCount > 1 && (
              <div className="px-6 py-4 flex items-center justify-between border-t border-primary-200">
                <div className="text-sm text-primary-700">
                  Showing <span className="font-medium">{(page - 1) * itemsPerPage + 1}</span>
                  {' '} to {' '}
                  <span className="font-medium">
                    {Math.min(page * itemsPerPage, filteredProducts.length)}
                  </span>
                  {' '} of {' '}
                  <span className="font-medium">{filteredProducts.length}</span> results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 border border-primary-300 rounded-md text-primary-700 disabled:text-primary-400 disabled:border-primary-200"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setPage(Math.min(pageCount, page + 1))}
                    disabled={page === pageCount}
                    className="px-3 py-1 border border-primary-300 rounded-md text-primary-700 disabled:text-primary-400 disabled:border-primary-200"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-primary-600">No products found matching your search criteria.</p>
          </div>
        )}
      </div>
      
      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsAddModalOpen(false)}></div>
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full relative z-10 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-primary-200">
                <h2 className="text-xl font-semibold">Add New Product</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-primary-700 mb-1">
                      Product Name*
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      className="w-full border border-primary-300 rounded-md px-3 py-2 focus:ring-accent-500 focus:border-accent-500"
                      required
                    />
                  </div>
                  
                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-primary-700 mb-1">
                      Description*
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      rows={4}
                      className="w-full border border-primary-300 rounded-md px-3 py-2 focus:ring-accent-500 focus:border-accent-500"
                      required
                    ></textarea>
                  </div>
                  
                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">
                      Price* (MAD)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleFormChange}
                      min="0"
                      step="0.01"
                      className="w-full border border-primary-300 rounded-md px-3 py-2 focus:ring-accent-500 focus:border-accent-500"
                      required
                    />
                  </div>
                  
                  {/* Category */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500"
                    >
                      <option value="simple">Simple T-Shirt</option>
                      <option value="oversized">Oversized T-Shirt</option>
                      <option value="delave">Delave T-Shirt</option>
                      <option value="sweatshirt">Sweatshirt</option>
                      <option value="hoodie">Hoodie</option>
                      <option value="tote">Tote Bag</option>
                      <option value="anime">Anime T-Shirt</option>
                    </select>
                  </div>
                  
                  {/* Anime Selection - Only show when category is anime */}
                  {formData.category === 'anime' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Anime Series</label>
                      <select
                        name="anime"
                        value={formData.anime}
                        onChange={handleFormChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent-500 focus:ring-accent-500"
                      >
                        <option value="one_piece">One Piece</option>
                        <option value="hunter_x_hunter">Hunter x Hunter</option>
                        <option value="naruto">Naruto</option>
                        <option value="dragon_ball">Dragon Ball</option>
                        <option value="jujutsu_kaisen">Jujutsu Kaisen</option>
                        <option value="attack_on_titan">Attack on Titan</option>
                        <option value="death_note">Death Note</option>
                        <option value="other">Other Anime</option>
                      </select>
                    </div>
                  )}
                  
                  {/* Stock */}
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">
                      Stock*
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleFormChange}
                      min="0"
                      className="w-full border border-primary-300 rounded-md px-3 py-2 focus:ring-accent-500 focus:border-accent-500"
                      required
                    />
                  </div>
                  
                  {/* Featured */}
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                        className="h-4 w-4 text-accent-600 focus:ring-accent-500 border-primary-300 rounded"
                      />
                      <span className="ml-2 text-sm text-primary-700">Featured Product</span>
                    </label>
                  </div>
                  
                  {/* Sizes */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-primary-700 mb-1">
                      Sizes*
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleSizesChange(size)}
                          className={`px-3 py-1 border rounded-md text-sm ${
                            formData.sizes.includes(size)
                              ? 'bg-primary-900 text-white border-primary-900'
                              : 'border-primary-300 text-primary-700'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Colors */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-primary-700 mb-1">
                      Colors*
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['Black', 'White', 'Grey', 'Navy', 'Red', 'Blue', 'Green', 'Sand'].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => handleColorsChange(color)}
                          className={`px-3 py-1 border rounded-md text-sm ${
                            formData.colors.includes(color)
                              ? 'bg-primary-900 text-white border-primary-900'
                              : 'border-primary-300 text-primary-700'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Color Images */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-primary-700 mb-1">
                      Color-Specific Images
                    </label>
                    {formData.colors.map((color) => (
                      <div key={color} className="mb-4">
                        <h4 className="text-sm font-medium text-primary-700 mb-2">{color}</h4>
                        <div className="flex items-center mb-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleImageUpload(file).then(url => {
                                  handleColorImagesChange(color, [...(formData.color_images[color] || []), url]);
                                });
                              }
                            }}
                            className="flex-1 border border-primary-300 rounded-l-md px-3 py-2 focus:ring-accent-500 focus:border-accent-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {(formData.color_images[color] || []).map((url, index) => (
                            <div key={index} className="relative group">
                              <img 
                                src={url} 
                                alt={`${color} product image ${index + 1}`}
                                className="w-full h-24 object-cover rounded-md"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newImages = formData.color_images[color].filter((_, i) => i !== index);
                                  handleColorImagesChange(color, newImages);
                                }}
                                className="absolute -top-2 -right-2 bg-error-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-primary-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-primary-300 rounded-md text-primary-700 hover:bg-primary-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-primary-900 text-white rounded-md hover:bg-primary-800"
                >
                  Add Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Product Modal */}
      {isEditModalOpen && currentProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsEditModalOpen(false)}></div>
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full relative z-10 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-primary-200">
                <h2 className="text-xl font-semibold">Edit Product</h2>
              </div>
              {/* Same form fields as Add Product, but populated with current product data */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-primary-700 mb-1">
                      Product Name*
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      className="w-full border border-primary-300 rounded-md px-3 py-2 focus:ring-accent-500 focus:border-accent-500"
                      required
                    />
                  </div>
                  
                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-primary-700 mb-1">
                      Description*
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      rows={4}
                      className="w-full border border-primary-300 rounded-md px-3 py-2 focus:ring-accent-500 focus:border-accent-500"
                      required
                    ></textarea>
                  </div>
                  
                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">
                      Price* (MAD)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleFormChange}
                      min="0"
                      step="0.01"
                      className="w-full border border-primary-300 rounded-md px-3 py-2 focus:ring-accent-500 focus:border-accent-500"
                      required
                    />
                  </div>
                  
                  {/* Category */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500"
                    >
                      <option value="simple">Simple T-Shirt</option>
                      <option value="oversized">Oversized T-Shirt</option>
                      <option value="delave">Delave T-Shirt</option>
                      <option value="sweatshirt">Sweatshirt</option>
                      <option value="hoodie">Hoodie</option>
                      <option value="tote">Tote Bag</option>
                      <option value="anime">Anime T-Shirt</option>
                    </select>
                  </div>
                  
                  {/* Anime Selection - Only show when category is anime */}
                  {formData.category === 'anime' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Anime Series</label>
                      <select
                        name="anime"
                        value={formData.anime}
                        onChange={handleFormChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent-500 focus:ring-accent-500"
                      >
                        <option value="one_piece">One Piece</option>
                        <option value="hunter_x_hunter">Hunter x Hunter</option>
                        <option value="naruto">Naruto</option>
                        <option value="dragon_ball">Dragon Ball</option>
                        <option value="jujutsu_kaisen">Jujutsu Kaisen</option>
                        <option value="attack_on_titan">Attack on Titan</option>
                        <option value="death_note">Death Note</option>
                        <option value="other">Other Anime</option>
                      </select>
                    </div>
                  )}
                  
                  {/* Stock */}
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">
                      Stock*
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleFormChange}
                      min="0"
                      className="w-full border border-primary-300 rounded-md px-3 py-2 focus:ring-accent-500 focus:border-accent-500"
                      required
                    />
                  </div>
                  
                  {/* Featured */}
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                        className="h-4 w-4 text-accent-600 focus:ring-accent-500 border-primary-300 rounded"
                      />
                      <span className="ml-2 text-sm text-primary-700">Featured Product</span>
                    </label>
                  </div>
                  
                  {/* Sizes */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-primary-700 mb-1">
                      Sizes*
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleSizesChange(size)}
                          className={`px-3 py-1 border rounded-md text-sm ${
                            formData.sizes.includes(size)
                              ? 'bg-primary-900 text-white border-primary-900'
                              : 'border-primary-300 text-primary-700'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Colors */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-primary-700 mb-1">
                      Colors*
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['Black', 'White', 'Grey', 'Navy', 'Red', 'Blue', 'Green', 'Sand'].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => handleColorsChange(color)}
                          className={`px-3 py-1 border rounded-md text-sm ${
                            formData.colors.includes(color)
                              ? 'bg-primary-900 text-white border-primary-900'
                              : 'border-primary-300 text-primary-700'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Color Images */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-primary-700 mb-1">
                      Color-Specific Images
                    </label>
                    {formData.colors.map((color) => (
                      <div key={color} className="mb-4">
                        <h4 className="text-sm font-medium text-primary-700 mb-2">{color}</h4>
                        <div className="flex items-center mb-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleImageUpload(file).then(url => {
                                  handleColorImagesChange(color, [...(formData.color_images[color] || []), url]);
                                });
                              }
                            }}
                            className="flex-1 border border-primary-300 rounded-l-md px-3 py-2 focus:ring-accent-500 focus:border-accent-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {(formData.color_images[color] || []).map((url, index) => (
                            <div key={index} className="relative group">
                              <img 
                                src={url} 
                                alt={`${color} product image ${index + 1}`}
                                className="w-full h-24 object-cover rounded-md"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newImages = formData.color_images[color].filter((_, i) => i !== index);
                                  handleColorImagesChange(color, newImages);
                                }}
                                className="absolute -top-2 -right-2 bg-error-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-primary-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-primary-300 rounded-md text-primary-700 hover:bg-primary-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-primary-900 text-white rounded-md hover:bg-primary-800"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && currentProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsDeleteModalOpen(false)}></div>
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full relative z-10">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
                <p className="text-primary-700">
                  Are you sure you want to delete <span className="font-medium">{currentProduct.name}</span>? 
                  This action cannot be undone.
                </p>
              </div>
              <div className="p-6 border-t border-primary-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 border border-primary-300 rounded-md text-primary-700 hover:bg-primary-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteProduct}
                  className="px-4 py-2 bg-error-600 text-white rounded-md hover:bg-error-700"
                >
                  Delete Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProducts;