import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Menu, X, Zap, User, Bell, Settings, LogOut } from 'lucide-react';

interface NavbarProps {
  onNavigate?: (page: string) => void;
  currentPage?: string;
  isSignedIn?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage = 'home', isSignedIn = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navItems = [
    { id: 'product', label: 'Product', href: '#' },
    { id: 'solutions', label: 'Solutions', href: '#' },
    { id: 'pricing', label: 'Pricing', href: '#' },
    { id: 'resources', label: 'Resources', href: '#' },
    { id: 'company', label: 'Company', href: '#' }
  ];

  // Show signed-in state for product page
  const showSignedIn = currentPage === 'product' || isSignedIn;

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ExchangeFlow
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate?.(item.id)}
                className={`text-sm font-medium transition-colors duration-200 hover:text-blue-600 ${
                  currentPage === item.id ? 'text-blue-600' : 'text-slate-600'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA / User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {showSignedIn ? (
              // Signed-in user interface
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="relative"
                  onClick={() => onNavigate?.('notifications')}
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </Button>
                
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">ER</span>
                    </div>
                    <span className="text-sm font-medium text-slate-700">Erik R</span>
                  </button>

                  {/* User dropdown menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                      <div className="px-4 py-2 border-b border-slate-200">
                        <p className="text-sm font-medium text-slate-900">Erik Richardson</p>
                        <p className="text-xs text-slate-500">erik.r@company.com</p>
                      </div>
                      <button 
                        onClick={() => onNavigate?.('dashboard')}
                        className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Dashboard
                      </button>
                      <button 
                        onClick={() => onNavigate?.('profile')}
                        className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </button>
                      <div className="border-t border-slate-200 mt-1 pt-1">
                        <button 
                          onClick={() => onNavigate?.('logout')}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Not signed in interface
              <>
                <button 
                  onClick={() => onNavigate?.('login')}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Sign In
                </button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => onNavigate?.('demo')}
                >
                  Request Demo
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4">
            <div className="space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate?.(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`block w-full text-left text-base font-medium transition-colors duration-200 hover:text-blue-600 ${
                    currentPage === item.id ? 'text-blue-600' : 'text-slate-600'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              
              <div className="pt-4 border-t border-slate-200 space-y-3">
                {showSignedIn ? (
                  // Mobile signed-in interface
                  <>
                    <div className="flex items-center space-x-3 px-2 py-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">ER</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Erik Richardson</p>
                        <p className="text-sm text-slate-500">erik.r@company.com</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        onNavigate?.('dashboard');
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left text-base font-medium text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      Dashboard
                    </button>
                    <button 
                      onClick={() => {
                        onNavigate?.('profile');
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left text-base font-medium text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      Settings
                    </button>
                    <button 
                      onClick={() => {
                        onNavigate?.('logout');
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left text-base font-medium text-red-600 hover:text-red-700 transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  // Mobile not signed in interface
                  <>
                    <button 
                      onClick={() => {
                        onNavigate?.('login');
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left text-base font-medium text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      Sign In
                    </button>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        onNavigate?.('demo');
                        setIsMenuOpen(false);
                      }}
                    >
                      Request Demo
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};