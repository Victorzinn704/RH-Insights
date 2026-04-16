import { Users, ChevronRight } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => Promise<void>;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-zinc-950 text-white p-6 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-md w-full text-center space-y-12 animate-in fade-in zoom-in duration-1000 relative z-10">
        <div className="flex justify-center">
          <div className="p-6 bg-emerald-500/10 rounded-[2.5rem] border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
            <Users className="w-16 h-16 text-emerald-500" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-6xl font-black tracking-tighter leading-none">
            HR <span className="text-emerald-500">INSIGHT</span>
          </h1>
          <p className="text-zinc-400 text-lg font-medium tracking-tight">
            Inteligência Artificial para Gestão Estratégica de Pessoas
          </p>
        </div>

        <div className="space-y-6">
          <button
            onClick={onLogin}
            className="group w-full py-5 px-8 bg-white text-zinc-950 font-black rounded-2xl hover:bg-emerald-500 hover:text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl flex items-center justify-center gap-4 text-lg"
          >
            Acessar Portal Corporativo
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="flex items-center justify-center gap-8 pt-4">
            <div className="text-center">
              <p className="text-emerald-500 font-black text-xl">100%</p>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Seguro</p>
            </div>
            <div className="w-px h-8 bg-zinc-800" />
            <div className="text-center">
              <p className="text-blue-500 font-black text-xl">IA</p>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Powered</p>
            </div>
            <div className="w-px h-8 bg-zinc-800" />
            <div className="text-center">
              <p className="text-amber-500 font-black text-xl">PRO</p>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Ready</p>
            </div>
          </div>
        </div>

        <div className="pt-8">
          <p className="text-[10px] text-zinc-600 uppercase tracking-[0.4em] font-mono font-bold">
            Enterprise Security Protocol v3.4.0
          </p>
        </div>
      </div>
    </div>
  );
}
