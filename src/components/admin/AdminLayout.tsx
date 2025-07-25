import React, { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ChevronDown,
  DollarSign
} from 'lucide-react';
import Logo from '../layout/Logo';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Close sidebar when location changes (on mobile)
    setSidebarOpen(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('immortex_admin');
    navigate('/admin/login');
  };

  const navItems = [
    { icon: <LayoutDashboard size={20} />, text: 'Dashboard', href: '/admin' },
    { icon: <ShoppingBag size={20} />, text: 'Products', href: '/admin/products' },
    { icon: <FileText size={20} />, text: 'Orders', href: '/admin/orders' },
    { icon: <Users size={20} />, text: 'Customers', href: '/admin/customers' },
    { icon: <DollarSign size={20} />, text: 'Cash Flow', href: '/admin/cashflow' },
    { icon: <Settings size={20} />, text: 'Settings', href: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-primary-900 text-white transition-transform duration-300 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-primary-800">
          {/* Remove Link wrapper, Logo already includes a Link */}
          <Logo size="md" showText={true} className="text-white" />
          <span className="ml-2 text-sm text-primary-300">Admin</span>
        </div>
        
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                location.pathname === item.href
                  ? 'bg-primary-800 text-white'
                  : 'hover:bg-primary-800/60'
              }`}
            >
              {item.icon}
              <span className="ml-3">{item.text}</span>
            </Link>
          ))}
          
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 mt-4 text-left rounded-md hover:bg-primary-800/60 transition-colors"
          >
            <LogOut size={20} />
            <span className="ml-3">Logout</span>
          </button>
        </nav>
      </aside>
      
      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center">
              <button
                className="text-primary-900 lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h1 className="text-xl font-medium text-primary-900 ml-4">{title}</h1>
            </div>
            
            <div className="flex items-center">
              <div className="relative">
                <button className="flex items-center text-primary-900 hover:text-primary-700">
                  <div className="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center mr-2">
                    <span className="font-medium">A</span>
                  </div>
                  <span className="mr-1">Admin</span>
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;