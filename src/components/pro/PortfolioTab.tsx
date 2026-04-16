import { FileText } from 'lucide-react';
import { Employee, CompanyPortfolio } from '../../types';
import { User } from 'firebase/auth';

interface PortfolioTabProps {
  portfolio: CompanyPortfolio | null;
  employees: Employee[];
  user: User;
  isDarkMode: boolean;
  isAnalyzing: boolean;
  onOpenModal: () => void;
  onRunStrategicDecision: () => void;
}

export function PortfolioTab({
  portfolio,
  employees,
  user,
  isDarkMode,
  isAnalyzing,
  onOpenModal,
  onRunStrategicDecision,
}: PortfolioTabProps) {
  return (
    <div className="space-y-8">
      <div className={`p-10 rounded-[40px] border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-xl'}`}>
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
              {portfolio?.logoUrl ? (
                <img src={portfolio.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-2xl" referrerPolicy="no-referrer" />
              ) : (
                <FileText className="w-8 h-8" />
              )}
            </div>
            <div>
              <h4 className={`text-2xl font-black uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                {portfolio?.companyName || 'Sua Empresa'}
              </h4>
              <p className="text-emerald-500 font-medium">{portfolio?.tagline || 'Seu slogan de marketing aqui'}</p>
            </div>
          </div>
          <button
            onClick={onOpenModal}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'}`}
          >
            Editar Marketing
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h5 className={`text-xs font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>Sobre a Empresa</h5>
            <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-slate-600'}`}>
              {portfolio?.description || 'Descreva sua empresa para seus clientes e parceiros. Destaque seus diferenciais e o que torna seu negócio único no mercado.'}
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-100'}`}>
                <p className="text-[10px] uppercase font-black text-emerald-500 mb-2">Missão</p>
                <p className="text-xs font-medium leading-relaxed">{portfolio?.mission || 'Nossa missão é...'}</p>
              </div>
              <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-100'}`}>
                <p className="text-[10px] uppercase font-black text-blue-500 mb-2">Visão</p>
                <p className="text-xs font-medium leading-relaxed">{portfolio?.vision || 'Nossa visão é...'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h5 className={`text-xs font-black uppercase tracking-[0.2em] mb-6 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>Nossos Valores</h5>
              <div className="flex flex-wrap gap-3">
                {(portfolio?.values || ['Inovação', 'Qualidade', 'Foco no Cliente']).map((val, i) => (
                  <span key={i} className={`px-4 py-2 rounded-full text-xs font-bold ${isDarkMode ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-900/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                    {val}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h5 className={`text-xs font-black uppercase tracking-[0.2em] mb-6 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>Destaques do Time</h5>
              <div className="space-y-4">
                {employees.slice(0, 3).map(emp => (
                  <div key={emp.id} className={`flex items-center gap-4 p-4 rounded-2xl border ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-slate-100'}`}>
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{emp.name}</p>
                      <p className="text-[10px] text-zinc-500 uppercase font-bold">{emp.position}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-[10px] text-emerald-500 font-black">{emp.performance}/10</p>
                      <p className="text-[8px] text-zinc-500 uppercase">Performance</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className={`p-10 rounded-[40px] border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-xl'}`}>
          <h5 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-2">
            <div className="w-1.5 h-4 bg-amber-500 rounded-full" />
            Marketing Gerado por IA
          </h5>
          <p className={`text-sm leading-relaxed mb-6 ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
            Use nossa IA para gerar um pitch de vendas persuasivo baseado no seu perfil corporativo.
          </p>
          <button
            disabled={isAnalyzing}
            onClick={onRunStrategicDecision}
            className="w-full py-4 bg-amber-500 text-white font-black rounded-2xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? 'Gerando...' : 'Gerar Pitch de Vendas'}
          </button>
        </div>

        <div className={`p-10 rounded-[40px] border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-xl'}`}>
          <h5 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-2">
            <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
            Link de Portfólio Público
          </h5>
          <p className={`text-sm leading-relaxed mb-6 ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
            Compartilhe seu portfólio profissional com clientes e parceiros através de um link exclusivo.
          </p>
          <div className="flex gap-2">
            <input
              readOnly
              value={`hr-insight.com/p/${user.uid.slice(0, 8)}`}
              className={`flex-1 px-4 py-3 rounded-xl text-xs font-mono ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-slate-200'} border`}
            />
            <button
              onClick={() => navigator.clipboard.writeText(`hr-insight.com/p/${user.uid.slice(0, 8)}`)}
              className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
            >
              Copiar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
