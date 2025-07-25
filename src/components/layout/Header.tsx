import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, Search, User } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isScrolledRef = useRef(false);
  const headerRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const cartItems = useCartStore((state) => state.items);
  
  const cartItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      const shouldBeScrolled = window.scrollY > 50;
      if (shouldBeScrolled !== isScrolledRef.current) {
        isScrolledRef.current = shouldBeScrolled;
        if (headerRef.current) {
          headerRef.current.className = `fixed w-full top-0 z-50 transition-all duration-300 ${
            shouldBeScrolled ? 'bg-white shadow-md' : 'bg-transparent'
          }`;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when location changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <header 
      ref={headerRef}
      className="fixed w-full top-0 z-50 transition-all duration-300 bg-transparent"
      role="banner"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Logo size="lg" showText={false} />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8" role="navigation" aria-label="Main navigation">
          <Link to="/" className="text-primary-800 hover:text-primary-600 transition-colors">
            Home
          </Link>
          <Link to="/products" className="text-primary-800 hover:text-primary-600 transition-colors">
            Shop
          </Link>
          <Link to="/about" className="text-primary-800 hover:text-primary-600 transition-colors">
            About
          </Link>
          <Link to="/contact" className="text-primary-800 hover:text-primary-600 transition-colors">
            Contact
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <button 
            className="text-primary-800 hover:text-primary-600"
            aria-label="Search"
          >
            <Search size={20} />
          </button>
          <Link 
            to="/account" 
            className="text-primary-800 hover:text-primary-600"
            aria-label="Account"
          >
            <User size={20} />
          </Link>
          <Link 
            to="/cart" 
            className="text-primary-800 hover:text-primary-600 relative"
            aria-label={`Shopping cart (${cartItemsCount} items)`}
          >
            <ShoppingBag size={20} />
            {cartItemsCount > 0 && (
              <span 
                className="absolute -top-2 -right-2 bg-accent-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                aria-hidden="true"
              >
                {cartItemsCount}
              </span>
            )}
          </Link>
          <button 
            className="md:hidden text-primary-800" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            id="mobile-menu"
            className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              <Link to="/" className="text-primary-800 py-2 border-b border-gray-100">
                Home
              </Link>
              <Link to="/products" className="text-primary-800 py-2 border-b border-gray-100">
                Shop
              </Link>
              <Link to="/about" className="text-primary-800 py-2 border-b border-gray-100">
                About
              </Link>
              <Link to="/contact" className="text-primary-800 py-2">
                Contact
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;