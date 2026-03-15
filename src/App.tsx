import React, { useState, useEffect } from 'react';
import { 
  auth, db 
} from './firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User,
  signOut
} from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc,
  Timestamp,
  orderBy,
  setDoc,
  writeBatch
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  BrainCircuit, 
  Plus, 
  LogOut, 
  Search,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Briefcase,
  Home,
  Plane,
  HeartPulse,
  FileText,
  ChevronRight,
  Filter,
  Calculator,
  Package,
  BarChart3,
  Crown,
  Edit2,
  Trash2,
  Target,
  Eye,
  ShieldCheck,
  Download,
  Upload
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Markdown from 'react-markdown';
import toast from 'react-hot-toast';
import { Employee, Expense, Role, Status, ExpenseType, Currency, InventoryItem, RevenueRecord, Subscription, PlanType, CompanyPortfolio } from './types';
import { analyzeEmployeePerformance, getStrategicDecision } from './services/geminiService';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ROLE_HIERARCHY: Record<Role, number> = {
  'Gerente': 0,
  'Senior': 1,
  'Pleno': 2,
  'Junior': 3,
  'Estagiário': 4
};

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  toast.error(`Erro na operação (${operationType}): ${errInfo.error}`);
  throw new Error(JSON.stringify(errInfo));
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'employees' | 'expenses' | 'ai' | 'pro'>('dashboard');
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [revenue, setRevenue] = useState<RevenueRecord[]>([]);
  const [portfolio, setPortfolio] = useState<CompanyPortfolio | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [rates] = useState({ USD: 5.0, EUR: 5.4, BRL: 1.0 });
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  // Error Handler
  const handleFirestoreError = (error: any, operation: string, path: string) => {
    console.error(`Firestore Error [${operation}] at ${path}:`, error);
    // In a real microservice scenario, we would log this to a monitoring service
  };

  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProMenuOpen, setIsProMenuOpen] = useState(false);
  const [activeProSubTab, setActiveProSubTab] = useState<'inventory' | 'portfolio' | 'revenue'>('revenue');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Data Listeners
  useEffect(() => {
    if (!user) return;

    const qEmployees = query(collection(db, 'employees'), where('uid', '==', user.uid));
    const unsubEmployees = onSnapshot(qEmployees, (snapshot) => {
      setEmployees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'employees'));

    const qExpenses = query(collection(db, 'expenses'), where('uid', '==', user.uid), orderBy('date', 'desc'));
    const unsubExpenses = onSnapshot(qExpenses, (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'expenses'));

    const qInventory = query(collection(db, 'inventory'), where('uid', '==', user.uid));
    const unsubInventory = onSnapshot(qInventory, (snapshot) => {
      setInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'inventory'));

    const qRevenue = query(collection(db, 'revenue'), where('uid', '==', user.uid), orderBy('date', 'desc'));
    const unsubRevenue = onSnapshot(qRevenue, (snapshot) => {
      setRevenue(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RevenueRecord)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'revenue'));

    const qPortfolio = query(collection(db, 'portfolios'), where('uid', '==', user.uid));
    const unsubPortfolio = onSnapshot(qPortfolio, (snapshot) => {
      if (!snapshot.empty) {
        setPortfolio({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as CompanyPortfolio);
      } else {
        setPortfolio(null);
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'portfolios'));

    const qSub = query(collection(db, 'subscriptions'), where('uid', '==', user.uid));
    const unsubSub = onSnapshot(qSub, (snapshot) => {
      if (user.email === 'jvictodacruz13@gmail.com') {
        setSubscription({ plan: 'pro', status: 'active', currentPeriodEnd: null, uid: user.uid });
        return;
      }
      if (!snapshot.empty) {
        setSubscription(snapshot.docs[0].data() as Subscription);
      } else {
        setSubscription({ plan: 'free', status: 'active', currentPeriodEnd: null, uid: user.uid });
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'subscriptions'));

    return () => {
      unsubEmployees();
      unsubExpenses();
      unsubInventory();
      unsubRevenue();
      unsubPortfolio();
      unsubSub();
    };
  }, [user]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      console.error("Login error", error);
    }
  };

  const handleLogout = () => signOut(auth);

  const addEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    const employeeData = {
      name: formData.get('name') as string,
      role: formData.get('role') as Role,
      position: formData.get('position') as string,
      section: formData.get('section') as string,
      salary: Number(formData.get('salary')),
      status: formData.get('status') as Status,
      performance: Number(formData.get('performance')),
      complaints: Number(formData.get('complaints')),
      medicalCertificatesCount: Number(formData.get('medicalCertificatesCount')),
      area: formData.get('area') as string,
      uid: user.uid
    };

    try {
      if (editingEmployee?.id) {
        await updateDoc(doc(db, 'employees', editingEmployee.id), employeeData);
        toast.success('Funcionário atualizado com sucesso!');
      } else {
        await addDoc(collection(db, 'employees'), employeeData);
        toast.success('Funcionário adicionado com sucesso!');
      }
      setIsEmployeeModalOpen(false);
      setEditingEmployee(null);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      handleFirestoreError(error, editingEmployee?.id ? OperationType.UPDATE : OperationType.CREATE, 'employees');
    }
  };

  const deleteEmployee = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este funcionário?')) {
      try {
        await deleteDoc(doc(db, 'employees', id));
        toast.success('Funcionário excluído com sucesso!');
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, 'employees');
      }
    }
  };

  const addInventoryItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || subscription?.plan !== 'pro') return;
    const formData = new FormData(e.currentTarget);
    const newItem = {
      name: formData.get('name') as string,
      quantity: Number(formData.get('quantity')),
      category: formData.get('category') as string,
      unitPrice: Number(formData.get('unitPrice')),
      uid: user.uid
    };
    try {
      await addDoc(collection(db, 'inventory'), newItem);
      toast.success('Item adicionado ao estoque!');
      setIsInventoryModalOpen(false);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'inventory');
    }
  };

  const addRevenueRecord = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || subscription?.plan !== 'pro') return;
    const formData = new FormData(e.currentTarget);
    const newRecord = {
      type: formData.get('type') as 'in' | 'out',
      amount: Number(formData.get('amount')),
      category: formData.get('category') as string,
      date: Timestamp.now(),
      description: formData.get('description') as string,
      uid: user.uid
    };
    try {
      await addDoc(collection(db, 'revenue'), newRecord);
      toast.success('Registro adicionado com sucesso!');
      setIsRevenueModalOpen(false);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'revenue');
    }
  };

  const savePortfolio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || subscription?.plan !== 'pro') return;
    const formData = new FormData(e.currentTarget);
    const portfolioData = {
      companyName: formData.get('companyName') as string,
      tagline: formData.get('tagline') as string,
      description: formData.get('description') as string,
      logoUrl: formData.get('logoUrl') as string,
      mission: formData.get('mission') as string,
      vision: formData.get('vision') as string,
      values: (formData.get('values') as string).split(',').map(v => v.trim()),
      uid: user.uid
    };

    try {
      if (portfolio?.id) {
        await updateDoc(doc(db, 'portfolios', portfolio.id), portfolioData);
        toast.success('Portfólio atualizado com sucesso!');
      } else {
        await addDoc(collection(db, 'portfolios'), portfolioData);
        toast.success('Portfólio criado com sucesso!');
      }
      setIsPortfolioModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, portfolio?.id ? OperationType.UPDATE : OperationType.CREATE, 'portfolios');
    }
  };

  const upgradeToPro = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'subscriptions', user.uid), {
        plan: 'pro',
        status: 'active',
        currentPeriodEnd: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        uid: user.uid
      });
      toast.success('Parabéns! Você agora é um usuário PRO.');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'subscriptions');
    }
  };

  const exportData = () => {
    const data = {
      employees,
      expenses,
      inventory,
      revenue,
      portfolio,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hr-insight-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!confirm('Atenção: A importação irá adicionar novos registros ao seu banco de dados atual. Deseja continuar?')) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        // Anti-DoS: Limit total items to prevent quota exhaustion
        let totalItems = 0;
        if (data.employees) totalItems += data.employees.length;
        if (data.expenses) totalItems += data.expenses.length;
        if (data.inventory && subscription?.plan === 'pro') totalItems += data.inventory.length;
        if (data.revenue && subscription?.plan === 'pro') totalItems += data.revenue.length;

        if (totalItems > 500) {
          toast.error('O arquivo é muito grande. O limite é de 500 registros por importação para evitar sobrecarga.');
          return;
        }

        const batch = writeBatch(db);
        
        // Import Employees
        if (data.employees) {
          for (const emp of data.employees) {
            const { id, ...rest } = emp;
            const docRef = doc(collection(db, 'employees'));
            batch.set(docRef, { ...rest, uid: user.uid });
          }
        }
        
        // Import Expenses
        if (data.expenses) {
          for (const exp of data.expenses) {
            const { id, ...rest } = exp;
            const docRef = doc(collection(db, 'expenses'));
            batch.set(docRef, { ...rest, uid: user.uid });
          }
        }

        // Import Inventory (PRO)
        if (data.inventory && subscription?.plan === 'pro') {
          for (const item of data.inventory) {
            const { id, ...rest } = item;
            const docRef = doc(collection(db, 'inventory'));
            batch.set(docRef, { ...rest, uid: user.uid });
          }
        }

        // Import Revenue (PRO)
        if (data.revenue && subscription?.plan === 'pro') {
          for (const rev of data.revenue) {
            const { id, ...rest } = rev;
            const docRef = doc(collection(db, 'revenue'));
            batch.set(docRef, { ...rest, uid: user.uid });
          }
        }

        await batch.commit();
        toast.success('Importação concluída com sucesso!');
      } catch (error) {
        console.error('Erro na importação:', error);
        toast.error('Erro ao importar arquivo. Verifique se o formato está correto.');
      }
    };
    reader.readAsText(file);
  };

  const addExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    const newExpense = {
      type: formData.get('type') as ExpenseType,
      amount: Number(formData.get('amount')),
      currency: formData.get('currency') as Currency,
      date: Timestamp.now(),
      description: formData.get('description') as string,
      uid: user.uid
    };
    try {
      await addDoc(collection(db, 'expenses'), newExpense);
      toast.success('Despesa adicionada com sucesso!');
      setIsExpenseModalOpen(false);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'expenses');
    }
  };

  const convertToBRL = (amount: number, currency: Currency) => {
    return amount * rates[currency];
  };

  const totalMonthlyExpenses = expenses.reduce((acc, curr) => acc + convertToBRL(curr.amount, curr.currency), 0);
  const totalSalaries = employees.reduce((acc, curr) => acc + curr.salary, 0);

  const runAiAnalysis = async (employee: Employee) => {
    setAiAnalysis(null);
    setIsAnalyzing(true);
    const result = await analyzeEmployeePerformance(employee);
    setAiAnalysis(result || "Falha na análise.");
    setIsAnalyzing(false);
  };

  const runStrategicDecision = async () => {
    setIsAnalyzing(true);
    const result = await getStrategicDecision(employees, expenses);
    setAiAnalysis(result || "Falha na análise estratégica.");
    setIsAnalyzing(false);
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-zinc-50">Carregando...</div>;

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-zinc-950 text-white p-6 font-sans relative overflow-hidden">
        {/* Background Decorative Elements */}
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
              onClick={handleLogin}
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

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#09090b] text-zinc-100' : 'bg-[#f8fafc] text-slate-900'} font-sans flex`}>
      {/* Sidebar */}
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
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'employees', icon: Users, label: 'Capital Humano' },
            { id: 'expenses', icon: DollarSign, label: 'Gestão Financeira' },
            { id: 'ai', icon: BrainCircuit, label: 'IA Estratégica' },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
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

          {/* Recurso PRO with Nested Menu */}
          <div className="space-y-1">
            <button 
              onClick={() => setIsProMenuOpen(!isProMenuOpen)}
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
                  {[
                    { id: 'inventory', icon: Package, label: 'Estoque' },
                    { id: 'portfolio', icon: FileText, label: 'Portfólio' },
                    { id: 'revenue', icon: BarChart3, label: 'Fluxo de Caixa' },
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setActiveTab('pro');
                        setActiveProSubTab(sub.id as any);
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
            onClick={toggleDarkMode}
            className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800 text-yellow-500' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            {isDarkMode ? <Clock className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            <span className="text-xs font-bold uppercase tracking-wider">{isDarkMode ? 'Modo Claro' : 'Modo Escuro'}</span>
          </button>

          <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center gap-3 mb-4">
              <img src={user.photoURL || ''} className="w-10 h-10 rounded-xl border-2 border-emerald-500/20" alt="User" />
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold truncate">{user.displayName}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-tighter truncate">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" /> Encerrar Sessão
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10">
        {activeTab === 'dashboard' && (
          <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-black tracking-tighter uppercase">Painel de Controle</h2>
                <div className="flex items-center gap-4 mt-2">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-zinc-500' : 'text-slate-500'}`}>Inteligência de dados e monitoramento em tempo real.</p>
                  <div className="flex items-center gap-2 ml-4">
                    <button 
                      onClick={exportData}
                      className={`p-2 rounded-lg border transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${
                        isDarkMode ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800' : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                      title="Exportar Backup"
                    >
                      <Download className="w-3 h-3" /> Exportar
                    </button>
                    <label className={`p-2 rounded-lg border transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest cursor-pointer ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800' : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`} title="Importar Backup">
                      <Upload className="w-3 h-3" /> Importar
                      <input type="file" accept=".json" onChange={importData} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-emerald-500 font-bold">Status do Sistema: Online</p>
                <p className="font-mono text-sm opacity-50 capitalize">{format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: 'Capital Humano', value: employees.length, icon: Users, color: 'emerald', sub: 'Colaboradores ativos' },
                { label: 'Folha Mensal', value: `R$ ${totalSalaries.toLocaleString()}`, icon: DollarSign, color: 'blue', sub: 'Comprometimento salarial' },
                { label: 'OPEX Operacional', value: `R$ ${totalMonthlyExpenses.toLocaleString()}`, icon: Calculator, color: 'orange', sub: 'Gastos correntes' },
              ].map((stat, i) => (
                <div key={i} className={`p-8 rounded-[32px] border transition-all hover:scale-[1.02] ${
                  isDarkMode ? 'bg-zinc-900/50 border-zinc-800 shadow-2xl shadow-black/50' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'
                }`}>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`p-3 rounded-2xl ${
                      stat.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' :
                      stat.color === 'blue' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-orange-500/10 text-orange-500'
                    }`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div className="h-1 w-12 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                  </div>
                  <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-400'}`}>{stat.label}</p>
                  <h3 className={`text-3xl font-black tracking-tighter mb-1 ${isDarkMode ? 'text-white' : 'text-zinc-950'}`}>{stat.value}</h3>
                  <p className={`text-[10px] uppercase font-bold ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>{stat.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {[
                { title: 'Status da Equipe', type: 'pie' },
                { title: 'Distribuição por Cargo', type: 'bar' },
                { title: 'OPEX por Categoria', type: 'bar_expense' },
              ].map((chart, i) => (
                <div key={i} className={`p-8 rounded-[40px] border ${
                  isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
                }`}>
                  <h4 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                    {chart.title}
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      {chart.type === 'pie' ? (
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Na Empresa', value: employees.filter(e => e.status === 'Na Empresa').length },
                              { name: 'Home Office', value: employees.filter(e => e.status === 'Home Office').length },
                              { name: 'Afastados', value: employees.filter(e => ['Atestado', 'Tratamento de Saúde'].includes(e.status)).length },
                              { name: 'Outros', value: employees.filter(e => !['Na Empresa', 'Home Office', 'Atestado', 'Tratamento de Saúde'].includes(e.status)).length },
                            ]}
                            cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value"
                          >
                            {COLORS.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />)}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        </PieChart>
                      ) : (
                        <BarChart data={chart.type === 'bar' ? [
                          { name: 'Gerente', value: employees.filter(e => e.role === 'Gerente').length },
                          { name: 'Senior', value: employees.filter(e => e.role === 'Senior').length },
                          { name: 'Pleno', value: employees.filter(e => e.role === 'Pleno').length },
                          { name: 'Junior', value: employees.filter(e => e.role === 'Junior').length },
                        ] : [
                          { name: 'API', value: expenses.filter(ex => ex.type === 'API').reduce((a, c) => a + convertToBRL(c.amount, c.currency), 0) },
                          { name: 'Cloud', value: expenses.filter(ex => ex.type === 'Cloud').reduce((a, c) => a + convertToBRL(c.amount, c.currency), 0) },
                          { name: 'Utilidades', value: expenses.filter(ex => ['Luz', 'Água', 'Internet'].includes(ex.type)).reduce((a, c) => a + convertToBRL(c.amount, c.currency), 0) },
                          { name: 'Licença', value: expenses.filter(ex => ex.type === 'Licença').reduce((a, c) => a + convertToBRL(c.amount, c.currency), 0) },
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#27272a' : '#f1f5f9'} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: isDarkMode ? '#a1a1aa' : '#64748b' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: isDarkMode ? '#a1a1aa' : '#64748b' }} />
                          <Tooltip 
                            cursor={{ fill: isDarkMode ? '#18181b' : '#f8fafc' }} 
                            contentStyle={{ 
                              borderRadius: '16px', 
                              border: 'none',
                              backgroundColor: isDarkMode ? '#18181b' : '#fff',
                              color: isDarkMode ? '#fff' : '#000',
                              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                            }} 
                          />
                          <Bar dataKey="value" fill={chart.type === 'bar' ? '#3b82f6' : '#10b981'} radius={[6, 6, 0, 0]} barSize={32} />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'employees' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Funcionários</h2>
                <p className="text-zinc-500">Gerencie sua equipe e acompanhe disponibilidades.</p>
              </div>
              <button 
                onClick={() => {
                  setEditingEmployee(null);
                  setIsEmployeeModalOpen(true);
                }}
                className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
              >
                <Plus className="w-5 h-5" /> Novo Funcionário
              </button>
            </header>

            <div className={`rounded-3xl shadow-sm border overflow-hidden ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-black/5'}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className={`${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border-b`}>
                      <th className="px-6 py-4 text-xs font-mono uppercase tracking-widest text-zinc-400">Funcionário</th>
                      <th className="px-6 py-4 text-xs font-mono uppercase tracking-widest text-zinc-400">Cargo & Nível</th>
                      <th className="px-6 py-4 text-xs font-mono uppercase tracking-widest text-zinc-400">Status</th>
                      <th className="px-6 py-4 text-xs font-mono uppercase tracking-widest text-zinc-400">Salário</th>
                      <th className="px-6 py-4 text-xs font-mono uppercase tracking-widest text-zinc-400">Ações</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-zinc-800' : 'divide-black/5'}`}>
                    {[...employees].sort((a, b) => {
                      const roleDiff = ROLE_HIERARCHY[a.role] - ROLE_HIERARCHY[b.role];
                      if (roleDiff !== 0) return roleDiff;
                      return b.salary - a.salary;
                    }).map(emp => (
                      <tr key={emp.id} className={`transition-colors group ${isDarkMode ? 'hover:bg-zinc-800/50' : 'hover:bg-zinc-50/50'}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isDarkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                              {emp.name.charAt(0)}
                            </div>
                            <div>
                              <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>{emp.name}</p>
                              <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>{emp.section}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-zinc-200' : 'text-zinc-900'}`}>{emp.position}</p>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            emp.role === 'Gerente' ? (isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700') :
                            emp.role === 'Senior' ? (isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700') :
                            emp.role === 'Pleno' ? (isDarkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700') :
                            emp.role === 'Junior' ? (isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-700') :
                            (isDarkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700')
                          }`}>
                            {emp.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${
                              emp.status === 'Disponível' || emp.status === 'Na Empresa' ? 'bg-emerald-500 shadow-emerald-500/40 animate-pulse' :
                              emp.status === 'Home Office' ? 'bg-blue-500 shadow-blue-500/40' :
                              ['Atestado', 'Tratamento de Saúde'].includes(emp.status) ? 'bg-red-500 shadow-red-500/40' :
                              'bg-zinc-400'
                            }`} />
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>{emp.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm">
                          <span className={isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}>R$ {emp.salary.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => {
                                setSelectedEmployee(emp);
                                runAiAnalysis(emp);
                              }}
                              className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-zinc-800 text-emerald-500' : 'hover:bg-emerald-50 text-emerald-600'}`}
                              title="Análise IA"
                            >
                              <BrainCircuit className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => {
                                setEditingEmployee(emp);
                                setIsEmployeeModalOpen(true);
                              }}
                              className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-zinc-800 text-blue-500' : 'hover:bg-blue-50 text-blue-600'}`}
                              title="Editar"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => deleteEmployee(emp.id!)}
                              className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-zinc-800 text-red-500' : 'hover:bg-red-50 text-red-600'}`}
                              title="Excluir"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
             <header className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Gastos & Finanças</h2>
                <p className="text-zinc-500">Controle de despesas operacionais e conversão de moedas.</p>
              </div>
              <button 
                onClick={() => setIsExpenseModalOpen(true)}
                className="bg-zinc-900 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-black transition-colors shadow-lg"
              >
                <Plus className="w-5 h-5" /> Registrar Gasto
              </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-black/5'}`}>
                <p className="text-xs font-mono uppercase text-zinc-400 mb-1">Câmbio USD</p>
                <p className="text-xl font-bold">R$ {rates.USD.toFixed(2)}</p>
              </div>
              <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-black/5'}`}>
                <p className="text-xs font-mono uppercase text-zinc-400 mb-1">Câmbio EUR</p>
                <p className="text-xl font-bold">R$ {rates.EUR.toFixed(2)}</p>
              </div>
              <div className="bg-emerald-600 p-6 rounded-2xl text-white shadow-lg shadow-emerald-600/20">
                <p className="text-xs font-mono uppercase text-emerald-100 mb-1">Total Mensal (BRL)</p>
                <p className="text-2xl font-bold">R$ {totalMonthlyExpenses.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className={`rounded-3xl shadow-sm border overflow-hidden ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-black/5'}`}>
                <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-zinc-800' : 'border-black/5'}`}>
                  <h4 className="font-bold">Relatório Consolidado por Categoria</h4>
                </div>
                <div className="p-0">
                  <table className="w-full text-left">
                    <thead>
                      <tr className={`${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border-b`}>
                        <th className="px-6 py-3 text-xs font-mono uppercase text-zinc-400">Categoria</th>
                        <th className="px-6 py-3 text-xs font-mono uppercase text-zinc-400">Total (BRL)</th>
                        <th className="px-6 py-3 text-xs font-mono uppercase text-zinc-400">%</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? 'divide-zinc-800' : 'divide-black/5'}`}>
                      {['API', 'Cloud', 'Licença', 'Água', 'Luz', 'Internet'].map(cat => {
                        const total = expenses.filter(ex => ex.type === cat).reduce((a, c) => a + convertToBRL(c.amount, c.currency), 0);
                        const percentage = totalMonthlyExpenses > 0 ? (total / totalMonthlyExpenses) * 100 : 0;
                        return (
                          <tr key={cat} className={isDarkMode ? 'hover:bg-zinc-800/50' : 'hover:bg-zinc-50/50'}>
                            <td className="px-6 py-4 font-medium">{cat}</td>
                            <td className="px-6 py-4 font-mono">R$ {total.toLocaleString()}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                                  <div className="h-full bg-emerald-500" style={{ width: `${percentage}%` }} />
                                </div>
                                <span className="text-xs font-mono">{percentage.toFixed(1)}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={`rounded-3xl shadow-sm border overflow-hidden ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-black/5'}`}>
                <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-zinc-800' : 'border-black/5'}`}>
                  <h4 className="font-bold">Histórico de Despesas</h4>
                  <Filter className="w-5 h-5 text-zinc-400" />
                </div>
                <div className={`divide-y max-h-[400px] overflow-y-auto ${isDarkMode ? 'divide-zinc-800' : 'divide-black/5'}`}>
                  {expenses.map(ex => (
                        <div key={ex.id} className={`p-6 flex items-center justify-between transition-colors ${isDarkMode ? 'hover:bg-zinc-800/50' : 'hover:bg-zinc-50'}`}>
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${
                              ex.type === 'API' ? (isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700') :
                              ex.type === 'Cloud' ? (isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700') :
                              (isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-700')
                            }`}>
                              {ex.type === 'API' ? <BrainCircuit className="w-6 h-6" /> : 
                               ex.type === 'Cloud' ? <TrendingUp className="w-6 h-6" /> : 
                               <FileText className="w-6 h-6" />}
                            </div>
                            <div>
                              <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>{ex.type}</p>
                              <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>{ex.description || 'Sem descrição'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>{ex.currency} {ex.amount.toLocaleString()}</p>
                            <p className="text-xs text-emerald-500 font-medium">≈ R$ {convertToBRL(ex.amount, ex.currency).toLocaleString()}</p>
                          </div>
                        </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-8 animate-in zoom-in-95 duration-500">
            <header className="text-center max-w-2xl mx-auto space-y-4">
              <div className="inline-flex p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl text-emerald-700 dark:text-emerald-400 mb-2">
                <BrainCircuit className="w-8 h-8" />
              </div>
              <h2 className="text-4xl font-bold tracking-tight">Decisão Estratégica IA</h2>
              <p className={`${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>Nossa inteligência artificial analisa os dados de RH e Financeiro para sugerir as melhores rotas para sua empresa.</p>
              <button 
                onClick={runStrategicDecision}
                disabled={isAnalyzing}
                className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/30 disabled:opacity-50"
              >
                {isAnalyzing ? 'Analisando...' : 'Gerar Análise Estratégica'}
              </button>
            </header>

            <div className={`rounded-3xl shadow-sm border overflow-hidden ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-black/5'}`}>
              <div className="p-6 border-b border-black/5 dark:border-zinc-800">
                <h4 className="font-bold">Tabela Comparativa de Rendimento</h4>
                <p className="text-sm text-zinc-500">Comparativo direto para suporte à decisão gerencial.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className={`${isDarkMode ? 'bg-zinc-950 text-zinc-400' : 'bg-zinc-50 text-zinc-400'} border-b border-black/5 dark:border-zinc-800`}>
                      <th className="px-6 py-4 text-xs font-mono uppercase">Funcionário</th>
                      <th className="px-6 py-4 text-xs font-mono uppercase">Rendimento</th>
                      <th className="px-6 py-4 text-xs font-mono uppercase">Atestados</th>
                      <th className="px-6 py-4 text-xs font-mono uppercase">Reclamações</th>
                      <th className="px-6 py-4 text-xs font-mono uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-zinc-800' : 'divide-black/5'}`}>
                    {employees.sort((a, b) => b.performance - a.performance).map(emp => (
                      <tr key={emp.id} className={`${isDarkMode ? 'hover:bg-zinc-800/50' : 'hover:bg-zinc-50'} transition-colors`}>
                        <td className="px-6 py-4">
                          <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>{emp.name}</p>
                          <p className={`text-xs ${isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>{emp.area}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`flex-1 w-24 h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                              <div className={`h-full ${emp.performance > 7 ? 'bg-emerald-500' : emp.performance > 4 ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${emp.performance * 10}%` }} />
                            </div>
                            <span className={`font-mono font-bold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-700'}`}>{emp.performance}/10</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`font-mono ${emp.medicalCertificatesCount > 3 ? 'text-red-600 font-bold' : isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
                            {emp.medicalCertificatesCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`font-mono ${emp.complaints > 0 ? 'text-orange-600 font-bold' : isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
                            {emp.complaints}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-medium px-2 py-1 rounded-lg ${isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-700'}`}>{emp.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {aiAnalysis && !selectedEmployee && !isAnalyzing && (
              <div className={`max-w-4xl mx-auto p-10 rounded-[40px] shadow-xl border prose prose-emerald ${isDarkMode ? 'bg-zinc-900 border-zinc-800 prose-invert' : 'bg-white border-black/5'}`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
                    <BrainCircuit className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold m-0">Resultado da Análise Estratégica</h3>
                </div>
                <Markdown>{aiAnalysis}</Markdown>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pro' && (
          <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-black tracking-tighter uppercase flex items-center gap-3">
                  {activeProSubTab === 'revenue' ? 'Fluxo de Caixa' : 
                   activeProSubTab === 'inventory' ? 'Gestão de Estoque' : 
                   'Portfólio Corporativo'} 
                  <Crown className="w-8 h-8 text-amber-500" />
                </h2>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-zinc-500' : 'text-slate-500'}`}>
                  {activeProSubTab === 'revenue' ? 'Dashboard interativo de receitas e despesas.' : 
                   activeProSubTab === 'inventory' ? 'Controle total de insumos e ativos da empresa.' : 
                   'Nossa identidade, missão e valores fundamentais.'}
                </p>
              </div>
              {subscription?.plan !== 'pro' && (
                <button 
                  onClick={upgradeToPro}
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
                  onClick={upgradeToPro}
                  className="px-12 py-5 bg-amber-500 text-white font-black rounded-2xl hover:bg-amber-600 transition-all transform hover:scale-105 shadow-2xl shadow-amber-500/30 uppercase tracking-widest"
                >
                  Quero ser PRO agora
                </button>
              </div>
            ) : (
              <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                {activeProSubTab === 'revenue' && (
                  <div className={`p-8 rounded-[40px] border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-xl'}`}>
                    <div className="flex justify-between items-center mb-8">
                      <h4 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                        Fluxo de Caixa Interativo
                      </h4>
                      <button 
                        onClick={() => setIsRevenueModalOpen(true)}
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
                )}

                {activeProSubTab === 'inventory' && (
                  <div className={`p-8 rounded-[40px] border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-xl'}`}>
                    <div className="flex justify-between items-center mb-8">
                      <h4 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
                        Gestão de Estoque
                      </h4>
                      <button 
                        onClick={() => setIsInventoryModalOpen(true)}
                        className="p-2 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500/20 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {inventory.length === 0 ? (
                        <p className="col-span-full text-center py-20 text-zinc-500 text-sm italic">Nenhum item no estoque.</p>
                      ) : (
                        inventory.map(item => (
                          <div key={item.id} className={`p-6 rounded-3xl border transition-all hover:scale-[1.02] ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-100'}`}>
                            <div className="flex justify-between items-start mb-4">
                              <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                                <Package className="w-6 h-6" />
                              </div>
                              <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg ${isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-white text-zinc-500 shadow-sm'}`}>
                                {item.category}
                              </span>
                            </div>
                            <h5 className={`font-bold text-lg mb-1 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>{item.name}</h5>
                            <div className="flex justify-between items-end mt-6">
                              <div>
                                <p className="text-[10px] text-zinc-500 uppercase font-bold">Quantidade</p>
                                <p className={`font-mono text-xl font-black ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>{item.quantity} <span className="text-xs font-normal opacity-50">un</span></p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-zinc-500 uppercase font-bold">Valor Total</p>
                                <p className="text-emerald-500 font-bold">R$ {(item.quantity * item.unitPrice).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeProSubTab === 'portfolio' && (
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
                          onClick={() => setIsPortfolioModalOpen(true)}
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
                        <button className="w-full py-4 bg-amber-500 text-white font-black rounded-2xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 uppercase tracking-widest text-xs">
                          Gerar Pitch de Vendas
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
                          <button className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all">
                            Copiar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Employee Modal */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-zinc-900 text-white' : 'bg-white text-black'} w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300`}>
            <div className={`p-8 border-b ${isDarkMode ? 'border-zinc-800' : 'border-black/5'} flex justify-between items-center`}>
              <h3 className="text-2xl font-bold">{editingEmployee ? 'Editar Funcionário' : 'Novo Funcionário'}</h3>
              <button onClick={() => { setIsEmployeeModalOpen(false); setEditingEmployee(null); }} className={`p-2 ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'} rounded-full`}>
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <form onSubmit={addEmployee} className="p-8 grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Nome Completo</label>
                <input name="name" required defaultValue={editingEmployee?.name} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Cargo/Função</label>
                <input name="position" required defaultValue={editingEmployee?.position} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Área</label>
                <input name="area" required defaultValue={editingEmployee?.area} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Nível</label>
                <select name="role" defaultValue={editingEmployee?.role || 'Junior'} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}>
                  <option>Estagiário</option>
                  <option>Junior</option>
                  <option>Pleno</option>
                  <option>Senior</option>
                  <option>Gerente</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Seção/Setor</label>
                <input name="section" required defaultValue={editingEmployee?.section} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Salário (BRL)</label>
                <input name="salary" type="number" required defaultValue={editingEmployee?.salary} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Status</label>
                <select name="status" defaultValue={editingEmployee?.status || 'Disponível'} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}>
                  <option>Disponível</option>
                  <option>Na Empresa</option>
                  <option>Home Office</option>
                  <option>Férias</option>
                  <option>Viagem a Trabalho</option>
                  <option>Tratamento de Saúde</option>
                  <option>Atestado</option>
                  <option>Fora de Expediente</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Rendimento (1-10)</label>
                <input name="performance" type="number" min="1" max="10" defaultValue={editingEmployee?.performance || 5} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Reclamações</label>
                <input name="complaints" type="number" min="0" defaultValue={editingEmployee?.complaints || 0} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Atestados</label>
                <input name="medicalCertificatesCount" type="number" min="0" defaultValue={editingEmployee?.medicalCertificatesCount || 0} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
              </div>
              <div className="col-span-2 pt-4">
                <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-colors">
                  {editingEmployee ? 'Atualizar Dados' : 'Salvar Funcionário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-zinc-900 text-white' : 'bg-white text-black'} w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300`}>
            <div className={`p-8 border-b ${isDarkMode ? 'border-zinc-800' : 'border-black/5'} flex justify-between items-center`}>
              <h3 className="text-2xl font-bold">Registrar Gasto</h3>
              <button onClick={() => setIsExpenseModalOpen(false)} className={`p-2 ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'} rounded-full`}>
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <form onSubmit={addExpense} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Tipo de Gasto</label>
                <select name="type" className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}>
                  <option>API</option>
                  <option>Cloud</option>
                  <option>Licença</option>
                  <option>Água</option>
                  <option>Luz</option>
                  <option>Internet</option>
                  <option>Outros</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Valor</label>
                  <input name="amount" type="number" step="0.01" required className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Moeda</label>
                  <select name="currency" className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}>
                    <option>BRL</option>
                    <option>USD</option>
                    <option>EUR</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Descrição</label>
                <textarea name="description" className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 h-24`} />
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-colors">
                Confirmar Gasto
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Inventory Modal */}
      {isInventoryModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-zinc-900 text-white' : 'bg-white text-black'} w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300`}>
            <div className={`p-8 border-b ${isDarkMode ? 'border-zinc-800' : 'border-black/5'} flex justify-between items-center`}>
              <h3 className="text-2xl font-bold">Novo Item de Estoque</h3>
              <button onClick={() => setIsInventoryModalOpen(false)} className={`p-2 ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'} rounded-full`}>
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <form onSubmit={addInventoryItem} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Nome do Item</label>
                <input name="name" required className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Quantidade</label>
                  <input name="quantity" type="number" required className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Preço Unitário (BRL)</label>
                  <input name="unitPrice" type="number" step="0.01" required className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Categoria</label>
                <input name="category" required className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors">
                Adicionar ao Estoque
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Revenue Modal */}
      {isRevenueModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-zinc-900 text-white' : 'bg-white text-black'} w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300`}>
            <div className={`p-8 border-b ${isDarkMode ? 'border-zinc-800' : 'border-black/5'} flex justify-between items-center`}>
              <h3 className="text-2xl font-bold">Registrar Movimentação</h3>
              <button onClick={() => setIsRevenueModalOpen(false)} className={`p-2 ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'} rounded-full`}>
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <form onSubmit={addRevenueRecord} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Tipo</label>
                <select name="type" className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}>
                  <option value="in">Entrada (Receita)</option>
                  <option value="out">Saída (Despesa)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Valor (BRL)</label>
                <input name="amount" type="number" step="0.01" required className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Categoria</label>
                <input name="category" required className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Descrição</label>
                <textarea name="description" className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 h-24`} />
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-colors">
                Salvar Registro
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Portfolio Modal */}
      {isPortfolioModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-zinc-900 text-white' : 'bg-white text-black'} w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300`}>
            <div className={`p-8 border-b ${isDarkMode ? 'border-zinc-800' : 'border-black/5'} flex justify-between items-center`}>
              <h3 className="text-2xl font-bold">Editar Portfólio de Marketing</h3>
              <button onClick={() => setIsPortfolioModalOpen(false)} className={`p-2 ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'} rounded-full`}>
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <form onSubmit={savePortfolio} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Nome da Empresa</label>
                  <input name="companyName" required defaultValue={portfolio?.companyName} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Slogan (Tagline)</label>
                  <input name="tagline" defaultValue={portfolio?.tagline} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">URL do Logo</label>
                <input name="logoUrl" defaultValue={portfolio?.logoUrl} placeholder="https://exemplo.com/logo.png" className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Descrição de Marketing</label>
                <textarea name="description" defaultValue={portfolio?.description} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 h-32`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Missão</label>
                  <textarea name="mission" defaultValue={portfolio?.mission} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 h-24`} />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Visão</label>
                  <textarea name="vision" defaultValue={portfolio?.vision} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 h-24`} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">Valores (separados por vírgula)</label>
                <input name="values" defaultValue={portfolio?.values?.join(', ')} className={`w-full px-4 py-3 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-black/5'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`} />
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-colors">
                Salvar Portfólio
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AI Analysis Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-zinc-900 text-white' : 'bg-white text-black'} w-full max-w-3xl rounded-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500 max-h-[90vh] flex flex-col`}>
            <div className={`p-8 border-b ${isDarkMode ? 'border-zinc-800 bg-zinc-900/50' : 'border-black/5 bg-emerald-50/50'} flex justify-between items-center`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                  {selectedEmployee.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{selectedEmployee.name}</h3>
                  <p className="text-sm text-zinc-500">Análise de Performance IA</p>
                </div>
              </div>
              <button onClick={() => setSelectedEmployee(null)} className={`p-2 ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-white'} rounded-full shadow-sm`}>
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <div className={`p-10 overflow-y-auto flex-1 prose prose-emerald max-w-none ${isDarkMode ? 'prose-invert' : ''}`}>
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  <p className="font-medium text-zinc-500">A IA está processando os dados...</p>
                </div>
              ) : (
                <Markdown>{aiAnalysis}</Markdown>
              )}
            </div>
            <div className={`p-6 border-t ${isDarkMode ? 'border-zinc-800 bg-zinc-900/50' : 'border-black/5 bg-zinc-50'} flex justify-end`}>
              <button 
                onClick={() => setSelectedEmployee(null)}
                className={`px-6 py-2 ${isDarkMode ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700' : 'bg-white border-black/10 hover:bg-zinc-100'} border rounded-xl font-medium transition-colors`}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
