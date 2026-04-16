import { Plus } from 'lucide-react';
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area } from 'recharts';
import { RevenueRecord } from '../../types';

interface RevenueTabProps {
  revenue: RevenueRecord[];
  isDarkMode: boolean;
  onOpenModal: () => void;
}

export function RevenueTab({ revenue, isDarkMode, onOpenModal }: RevenueTabProps) {
  return (
    <div className={`p-8 rounded-[40px] border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-xl'}`}>
      <div className="flex justify-between items-center mb-8">
        <h4 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
          <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
          Fluxo de Caixa Interativo
        </h4>
        <button
          onClick={onOpenModal}
          className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenue.slice(0, 15).reverse()}>
            <defs>
              <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#27272a' : '#f1f5f9'} />
            <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: isDarkMode ? '#71717a' : '#64748b' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: isDarkMode ? '#71717a' : '#64748b' }} />
            <Tooltip
              contentStyle={{
                borderRadius: '16px',
                border: 'none',
                backgroundColor: isDarkMode ? '#18181b' : '#fff',
                color: isDarkMode ? '#fff' : '#000',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
              }}
            />
            <Area type="monotone" dataKey="amount" stroke="#10b981" fillOpacity={1} fill="url(#colorIn)" data={revenue.filter(r => r.type === 'in').slice(0, 10).reverse()} name="Entradas" />
            <Area type="monotone" dataKey="amount" stroke="#ef4444" fillOpacity={1} fill="url(#colorOut)" data={revenue.filter(r => r.type === 'out').slice(0, 10).reverse()} name="Saídas" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
