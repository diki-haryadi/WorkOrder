import { useEffect, useState } from 'react';
import { NavTab } from './types';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import WorkOrderPage from './pages/WorkOrder';
import QuotationPage from './pages/Quotation';
import InvoicePage from './pages/Invoice';
import ProfilePage from './pages/Profile';
import LoginPage from './pages/Login';
import { useAuth } from './context/AuthContext';
import MasterProductsServicesPage from './pages/MasterProductsServices';

export default function App() {
  const { session, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [authBootTimedOut, setAuthBootTimedOut] = useState(false);

  useEffect(() => {
    if (!loading) {
      setAuthBootTimedOut(false);
      return;
    }

    const timeout = window.setTimeout(() => {
      setAuthBootTimedOut(true);
    }, 8000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [loading]);

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <Home onNavigate={setActiveTab} />;
      case 'workorder':
        return <WorkOrderPage />;
      case 'quotation':
        return <QuotationPage />;
      case 'invoice':
        return <InvoicePage />;
      case 'profile':
        return <ProfilePage onNavigate={setActiveTab} />;
      case 'master_products_services':
        return <MasterProductsServicesPage onBack={() => setActiveTab('profile')} />;
    }
  };

  // if (loading && !authBootTimedOut) {
  //   return (
  //     <div className="min-h-screen bg-slate-50 flex items-center justify-center">
  //       <p className="text-sm text-slate-500">Memuat sesi pengguna...</p>
  //     </div>
  //   );
  // }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-lg mx-auto relative min-h-screen flex flex-col">
        <div className="flex-1 overflow-y-auto pb-20">
          {renderPage()}
        </div>
        <BottomNav active={activeTab} onChange={setActiveTab} />
      </div>
    </div>
  );
}
