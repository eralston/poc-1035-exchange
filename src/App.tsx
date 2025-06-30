import React, { useState } from 'react';
import { RealtimeProvider } from './contexts/RealtimeContext';
import { Navbar } from './components/Navbar';
import { ProductPage } from './components/ProductPage';
import { Dashboard } from './components/Dashboard';
import { CreateExchange } from './components/CreateExchange';
import { Button } from './components/ui/Button';
import { ArrowRight, Zap } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pageData, setPageData] = useState<any>(null);

  const handleNavigate = (page: string, data?: any) => {
    setCurrentPage(page);
    setPageData(data);
  };

  // Wrap the entire app with RealtimeProvider
  return (
    <RealtimeProvider>
      <AppContent 
        currentPage={currentPage} 
        pageData={pageData} 
        onNavigate={handleNavigate} 
      />
    </RealtimeProvider>
  );
}

interface AppContentProps {
  currentPage: string;
  pageData: any;
  onNavigate: (page: string, data?: any) => void;
}

const AppContent: React.FC<AppContentProps> = ({ currentPage, pageData, onNavigate }) => {
  // Dashboard view
  if (currentPage === 'dashboard' || currentPage === 'demo') {
    return (
      <div className="min-h-screen">
        <Dashboard onNavigate={onNavigate} />
      </div>
    );
  }

  // Create Exchange view
  if (currentPage === 'create-exchange') {
    return (
      <div className="min-h-screen">
        <CreateExchange onNavigate={onNavigate} />
      </div>
    );
  }

  // Product page
  if (currentPage === 'product') {
    return (
      <div className="min-h-screen">
        <Navbar onNavigate={onNavigate} currentPage={currentPage} />
        <ProductPage onNavigate={onNavigate} />
      </div>
    );
  }

  // Home page
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      <Navbar onNavigate={onNavigate} currentPage={currentPage} />
      
      {/* Simple home page with CTA to product page */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center space-y-8 max-w-4xl mx-auto px-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <Zap className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900">
            Welcome to
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ExchangeFlow
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            The future of 1035 exchange workflow management. Transform your antiquated processes into a seamless digital experience.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => onNavigate('product')}
              className="text-lg px-8 py-4"
            >
              Explore Our Product
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button 
              variant="secondary" 
              size="lg"
              onClick={() => onNavigate('dashboard')}
              className="text-lg px-8 py-4"
            >
              Try Demo
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;