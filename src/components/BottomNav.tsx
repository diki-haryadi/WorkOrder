import { Home, ClipboardList, FileText, Receipt, User } from 'lucide-react';
import { NavTab } from '../types';

interface BottomNavProps {
  active: NavTab;
  onChange: (tab: NavTab) => void;
}

const navItems: { tab: NavTab; label: string; Icon: React.ElementType }[] = [
  { tab: 'home', label: 'Home', Icon: Home },
  { tab: 'workorder', label: 'Work Order', Icon: ClipboardList },
  { tab: 'quotation', label: 'Quotation', Icon: FileText },
  { tab: 'invoice', label: 'Invoice', Icon: Receipt },
  { tab: 'profile', label: 'Profile', Icon: User },
];

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 safe-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around px-1">
        {navItems.map(({ tab, label, Icon }) => {
          const isActive = active === tab;
          return (
            <button
              key={tab}
              onClick={() => onChange(tab)}
              className="flex flex-col items-center justify-center flex-1 py-2 gap-0.5 group transition-all duration-200"
            >
              <div
                className={`flex items-center justify-center w-10 h-8 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50'
                    : 'group-hover:bg-slate-50'
                }`}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  className={`transition-colors duration-200 ${
                    isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
              </div>
              <span
                className={`text-[10px] font-medium transition-colors duration-200 leading-tight ${
                  isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              >
                {label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-transparent" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
