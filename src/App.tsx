import { useState } from 'react';
import { NavTab } from './types';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import WorkOrderPage from './pages/WorkOrder';
import QuotationPage from './pages/Quotation';
import InvoicePage from './pages/Invoice';
import ProfilePage from './pages/Profile';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');

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
        return <ProfilePage />;
    }
  };

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
