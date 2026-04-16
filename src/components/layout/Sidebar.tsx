import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  BrainCircuit,
  LogOut,
  Clock,
  FileText,
  ChevronRight,
  Package,
  BarChart3,
  Crown,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { CompanyPortfolio, Subscription } from '../../types';
import { isValidImageUrl } from '../../utils/sanitize';

interface SidebarProps {
  user: User;
  portfolio: CompanyPortfolio | null;
  subscription: Subscription | null;
  activeTab: string;
  activeProSubTab: string;
  isProMenuOpen: boolean;
  isDarkMode: boolean;
  onTabChange: (tab: 'dashboard' | 'employees' | 'expenses' | 'ai' | 'pro') => void;
  onProSubTabChange: (sub: 'inventory' | 'portfolio' | 'revenue') => void;
  onProMenuToggle: () => void;
  onToggleDarkMode: () => void;
  onLogout: () => void;
}

export function Sidebar({
  user,
  portfolio,
  subscription,
  activeTab,
  activeProSubTab,
  isProMenuOpen,
  isDarkMode,
  onTabChange,
  onProSubTabChange,
  onProMenuToggle,
  onToggleDarkMode,
  onLogout,
}: SidebarProps) {
  const mainNav = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'employees', icon: Users, label: 'Capital Humano' },
    { id: 'expenses', icon: DollarSign, label: 'Gestão Financeira' },
    { id: 'ai', icon: BrainCircuit, label: 'IA Estratégica' },
  ];

  const proSubNav = [
    { id: 'inventory', icon: Package, label: 'Estoque' },
    { id: 'portfolio', icon: FileText, label: 'Portfólio' },
    { id: 'revenue', icon: BarChart3, label: 'Fluxo de Caixa' },
  ];

  return (
    <aside className={`w-72 border-r transition-colors duration-300 flex flex-col ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-slate-200'}`}>
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <Users className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase truncate max-w-[180px]">
            {portfolio?.companyName || 'HR Insight'}
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {mainNav.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id as 'dashboard' | 'employees' | 'expenses' | 'ai' | 'pro')}
            className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-200 group relative ${
              activeTab === item.id
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 font-semibold'
                : `text-zinc-500 hover:translate-x-1 ${isDarkMode ? 'hover:bg-zinc-900 hover:text-zinc-200' : 'hover:bg-slate-50 hover:text-slate-900'}`
            }`}
          >
            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'group-hover:text-emerald-500 transition-colors'}`} />
            {item.label}
          </button>
        ))}

        <div className="space-y-1">
          <button
            onClick={onProMenuToggle}
            className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-200 group relative ${
              activeTab === 'pro'
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 font-semibold'
                : `text-zinc-500 hover:translate-x-1 ${isDarkMode ? 'hover:bg-zinc-900 hover:text-zinc-200' : 'hover:bg-slate-50 hover:text-slate-900'}`
            }`}
          >
            <Crown className={`w-5 h-5 ${activeTab === 'pro' ? 'text-white' : 'group-hover:text-amber-500 transition-colors'}`} />
            <span className="flex-1 text-left">Recursos PRO</span>
            {subscription?.plan !== 'pro' && (
              <Crown className="w-3 h-3 text-amber-500" />
            )}
            <ChevronRight className={`w-4 h-4 transition-transform duration-500 ${isProMenuOpen ? 'rotate-90' : ''}`} />
          </button>

          <AnimatePresence>
            {isProMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0, scaleY: 0.8 }}
                animate={{ height: 'auto', opacity: 1, scaleY: 1 }}
                exit={{ height: 0, opacity: 0, scaleY: 0.8 }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                className="pl-12 space-y-1 overflow-hidden origin-top"
              >
                {proSubNav.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      onTabChange('pro');
                      onProSubTabChange(sub.id as 'inventory' | 'portfolio' | 'revenue');
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
                      activeTab === 'pro' && activeProSubTab === sub.id
                        ? 'text-amber-500 bg-amber-500/10'
                        : `text-zinc-500 ${isDarkMode ? 'hover:text-zinc-200 hover:bg-zinc-900' : 'hover:text-slate-900 hover:bg-slate-50'}`
                    }`}
                  >
                    <sub.icon className="w-3.5 h-3.5" />
                    {sub.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      <div className="p-6 space-y-4">
        <button
          onClick={onToggleDarkMode}
          className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
            isDarkMode ? 'bg-zinc-900 border-zinc-800 text-yellow-500' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">{isDarkMode ? 'Modo Claro' : 'Modo Escuro'}</span>
        </button>

        <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <img
              src={isValidImageUrl(user.photoURL) ? user.photoURL! : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'U')}&background=10b981&color=fff`}
              className="w-10 h-10 rounded-xl border-2 border-emerald-500/20"
              alt="User"
            />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate">{user.displayName}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-tighter truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" /> Encerrar Sessão
          </button>
        </div>
      </div>
    </aside>
  );
}
