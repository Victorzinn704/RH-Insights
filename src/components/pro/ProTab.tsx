import { Crown, Package, FileText, BarChart3 } from 'lucide-react';
import { Employee, CompanyPortfolio, InventoryItem, RevenueRecord, Subscription, Currency } from '../../types';
import { User } from 'firebase/auth';
import { RevenueTab } from './RevenueTab';
import { InventoryTab } from './InventoryTab';
import { PortfolioTab } from './PortfolioTab';

interface ProTabProps {
  activeProSubTab: 'inventory' | 'portfolio' | 'revenue';
  subscription: Subscription | null;
  user: User;
  employees: Employee[];
  portfolio: CompanyPortfolio | null;
  inventory: InventoryItem[];
  revenue: RevenueRecord[];
  displayCurrency: Currency;
  rates: { USD: number; EUR: number; BRL: number };
  isDarkMode: boolean;
  isAnalyzing: boolean;
  onUpgradeToPro: () => void;
  onRunStrategicDecision: () => void;
  onOpenRevenueModal: () => void;
  onOpenInventoryModal: () => void;
  onOpenPortfolioModal: () => void;
}

export function ProTab({
  activeProSubTab,
  subscription,
  user,
  employees,
  portfolio,
  inventory,
  revenue,
  displayCurrency,
  rates,
  isDarkMode,
  isAnalyzing,
  onUpgradeToPro,
  onRunStrategicDecision,
  onOpenRevenueModal,
  onOpenInventoryModal,
  onOpenPortfolioModal,
}: ProTabProps) {
  const subTitles: Record<string, { title: string; desc: string }> = {
    revenue: { title: 'Fluxo de Caixa', desc: 'Dashboard interativo de receitas e despesas.' },
    inventory: { title: 'Gestão de Estoque', desc: 'Controle total de insumos e ativos da empresa.' },
    portfolio: { title: 'Portfólio Corporativo', desc: 'Nossa identidade, missão e valores fundamentais.' },
  };

  const current = subTitles[activeProSubTab]!;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black tracking-tighter uppercase flex items-center gap-3">
            {current.title}
            <Crown className="w-8 h-8 text-amber-500" />
          </h2>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-zinc-500' : 'text-slate-500'}`}>
            {current.desc}
          </p>
        </div>
        {subscription?.plan !== 'pro' && (
          <button
            onClick={onUpgradeToPro}
            className="bg-amber-500 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/20"
          >
            Assinar PRO - R$ 25/mês
          </button>
        )}
      </header>

      {subscription?.plan !== 'pro' ? (
        <div className={`p-16 rounded-[48px] border text-center space-y-8 ${isDarkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-slate-200 shadow-2xl'}`}>
          <div className="flex justify-center">
            <div className="p-6 bg-amber-500/10 rounded-full">
              <Crown className="w-16 h-16 text-amber-500" />
            </div>
          </div>
          <div className="max-w-xl mx-auto space-y-4">
            <h3 className="text-3xl font-black tracking-tighter uppercase">Desbloqueie o Potencial Máximo</h3>
            <p className={`${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Acesse ferramentas exclusivas de gestão de estoque, portfólio corporativo e dashboards financeiros interativos.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Package, title: 'Estoque', desc: 'Controle total de insumos e ativos.' },
              { icon: FileText, title: 'Portfólio', desc: 'Catálogo profissional da empresa.' },
              { icon: BarChart3, title: 'Fluxo de Caixa', desc: 'Dashboard interativo de receitas.' },
            ].map((feat, i) => (
              <div key={i} className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-100'}`}>
                <feat.icon className="w-8 h-8 text-amber-500 mx-auto mb-4" />
                <h4 className="font-bold text-sm uppercase mb-2">{feat.title}</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
          <button
            onClick={onUpgradeToPro}
            className="px-12 py-5 bg-amber-500 text-white font-black rounded-2xl hover:bg-amber-600 transition-all transform hover:scale-105 shadow-2xl shadow-amber-500/30 uppercase tracking-widest"
          >
            Quero ser PRO agora
          </button>
        </div>
      ) : (
        <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
          {activeProSubTab === 'revenue' && (
            <RevenueTab revenue={revenue} isDarkMode={isDarkMode} onOpenModal={onOpenRevenueModal} />
          )}
          {activeProSubTab === 'inventory' && (
            <InventoryTab
              inventory={inventory}
              isDarkMode={isDarkMode}
              displayCurrency={displayCurrency}
              rates={rates}
              onOpenModal={onOpenInventoryModal}
            />
          )}
          {activeProSubTab === 'portfolio' && (
            <PortfolioTab
              portfolio={portfolio}
              employees={employees}
              user={user}
              isDarkMode={isDarkMode}
              isAnalyzing={isAnalyzing}
              onOpenModal={onOpenPortfolioModal}
              onRunStrategicDecision={onRunStrategicDecision}
            />
          )}
        </div>
      )}
    </div>
  );
}
