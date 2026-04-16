import React, { lazy, Suspense, useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { useAuthSession } from './hooks/useAuthSession';
import { useAuthActions } from './hooks/useAuthActions';
import { useExchangeRates } from './hooks/useExchangeRates';
import { useFirestoreData } from './hooks/useFirestoreData';
import { useAiAnalysis } from './hooks/useAiAnalysis';
import { useModalState } from './hooks/useModalState';
import { useFirestoreMutations } from './hooks/useFirestoreMutations';
import { exportData, importData } from './utils/importExport';
import { LoginScreen } from './components/layout/LoginScreen';
import { Sidebar } from './components/layout/Sidebar';
import { RevenueFormModal } from './components/pro/RevenueFormModal';
import { InventoryFormModal } from './components/pro/InventoryFormModal';
import { PortfolioFormModal } from './components/pro/PortfolioFormModal';

const DashboardTab = lazy(() => import('./components/dashboard/DashboardTab').then(m => ({ default: m.DashboardTab })));
const EmployeesTab = lazy(() => import('./components/employees/EmployeesTab').then(m => ({ default: m.EmployeesTab })));
const ExpensesTab = lazy(() => import('./components/expenses/ExpensesTab').then(m => ({ default: m.ExpensesTab })));
const AiTab = lazy(() => import('./components/ai/AiTab').then(m => ({ default: m.AiTab })));
const ProTab = lazy(() => import('./components/pro/ProTab').then(m => ({ default: m.ProTab })));
const EmployeeFormModal = lazy(() => import('./components/employees/EmployeeFormModal').then(m => ({ default: m.EmployeeFormModal })));
const ExpenseFormModal = lazy(() => import('./components/expenses/ExpenseFormModal').then(m => ({ default: m.ExpenseFormModal })));
const AiAnalysisModal = lazy(() => import('./components/ai/AiAnalysisModal').then(m => ({ default: m.AiAnalysisModal })));

function LoadingTab() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, loading } = useAuthSession();
  const { handleLogin, handleLogout, upgradeToPro } = useAuthActions({ user });
  const { rates, displayCurrency, setDisplayCurrency } = useExchangeRates();
  const data = useFirestoreData(user);
  const { aiAnalysis, isAnalyzing, aiError, runAiAnalysis, runStrategicDecision } = useAiAnalysis(data.employees, data.expenses);
  const modals = useModalState();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'employees' | 'expenses' | 'ai' | 'pro'>('dashboard');
  const mutations = useFirestoreMutations({
    user,
    subscription: data.subscription,
    portfolio: data.portfolio,
    modals: { editingEmployee: modals.modals.editingEmployee },
    onCloseEmployeeModal: modals.closeEmployeeModal,
    onCloseExpenseModal: modals.closeExpenseModal,
    onCloseInventoryModal: modals.closeInventoryModal,
    onCloseRevenueModal: modals.closeRevenueModal,
    onClosePortfolioModal: modals.closePortfolioModal,
  });

  if (loading) return <div className="h-screen flex items-center justify-center bg-zinc-50">Carregando...</div>;
  if (!user) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#09090b] text-zinc-100' : 'bg-[#f8fafc] text-slate-900'} font-sans flex`}>
      <Sidebar
        user={user}
        portfolio={data.portfolio}
        subscription={data.subscription}
        activeTab={activeTab}
        activeProSubTab={modals.modals.activeProSubTab}
        isProMenuOpen={modals.modals.isProMenuOpen}
        isDarkMode={isDarkMode}
        onTabChange={setActiveTab}
        onProSubTabChange={modals.setProSubTab}
        onProMenuToggle={modals.toggleProMenu}
        onToggleDarkMode={toggleDarkMode}
        onLogout={handleLogout}
      />

      <main className="flex-1 overflow-y-auto p-10">
        {activeTab === 'dashboard' && (
          <Suspense fallback={<LoadingTab />}>
            <DashboardTab
              employees={data.employees}
              expenses={data.expenses}
              displayCurrency={displayCurrency}
              rates={rates}
              isDarkMode={isDarkMode}
              onCurrencyChange={setDisplayCurrency}
              onExport={() => exportData({ employees: data.employees, expenses: data.expenses, inventory: data.inventory, revenue: data.revenue, portfolio: data.portfolio })}
              onImport={(e) => importData(e, { user, subscription: data.subscription, onImport: () => {} })}
            />
          </Suspense>
        )}

        {activeTab === 'employees' && (
          <Suspense fallback={<LoadingTab />}>
            <EmployeesTab
              employees={data.employees}
              isDarkMode={isDarkMode}
              displayCurrency={displayCurrency}
              rates={rates}
              onAddNew={() => modals.openEmployeeModal(null)}
              onEdit={(emp: import('./types').Employee) => modals.openEmployeeModal(emp)}
              onDelete={mutations.deleteEmployee}
              onAiAnalysis={(emp: import('./types').Employee) => { modals.selectEmployee(emp); runAiAnalysis(emp); }}
            />
          </Suspense>
        )}

        {activeTab === 'expenses' && (
          <Suspense fallback={<LoadingTab />}>
            <ExpensesTab
              expenses={data.expenses}
              displayCurrency={displayCurrency}
              rates={rates}
              isDarkMode={isDarkMode}
              onCurrencyChange={setDisplayCurrency}
              onAddExpense={modals.openExpenseModal}
            />
          </Suspense>
        )}

        {activeTab === 'ai' && (
          <Suspense fallback={<LoadingTab />}>
            <AiTab
              employees={data.employees}
              isAnalyzing={isAnalyzing}
              aiAnalysis={aiAnalysis}
              isDarkMode={isDarkMode}
              onRunStrategicDecision={runStrategicDecision}
            />
          </Suspense>
        )}

        {activeTab === 'pro' && (
          <Suspense fallback={<LoadingTab />}>
            <ProTab
              activeProSubTab={modals.modals.activeProSubTab}
              subscription={data.subscription}
              user={user}
              employees={data.employees}
              portfolio={data.portfolio}
              inventory={data.inventory}
              revenue={data.revenue}
              displayCurrency={displayCurrency}
              rates={rates}
              isDarkMode={isDarkMode}
              isAnalyzing={isAnalyzing}
              onUpgradeToPro={upgradeToPro}
              onRunStrategicDecision={runStrategicDecision}
              onOpenRevenueModal={modals.openRevenueModal}
              onOpenInventoryModal={modals.openInventoryModal}
              onOpenPortfolioModal={modals.openPortfolioModal}
            />
          </Suspense>
        )}
      </main>

      <Suspense fallback={null}>
        <EmployeeFormModal
          isOpen={modals.modals.isEmployeeModalOpen}
          editingEmployee={modals.modals.editingEmployee}
          isDarkMode={isDarkMode}
          onClose={modals.closeEmployeeModal}
          onSubmit={mutations.addEmployee}
        />
      </Suspense>

      <Suspense fallback={null}>
        <ExpenseFormModal
          isOpen={modals.modals.isExpenseModalOpen}
          isDarkMode={isDarkMode}
          onClose={modals.closeExpenseModal}
          onSubmit={mutations.addExpense}
        />
      </Suspense>

      <InventoryFormModal
        isOpen={modals.modals.isInventoryModalOpen}
        isDarkMode={isDarkMode}
        onClose={modals.closeInventoryModal}
        onSubmit={mutations.addInventoryItem}
      />

      <RevenueFormModal
        isOpen={modals.modals.isRevenueModalOpen}
        isDarkMode={isDarkMode}
        onClose={modals.closeRevenueModal}
        onSubmit={mutations.addRevenueRecord}
      />

      <PortfolioFormModal
        isOpen={modals.modals.isPortfolioModalOpen}
        portfolio={data.portfolio}
        isDarkMode={isDarkMode}
        onClose={modals.closePortfolioModal}
        onSubmit={mutations.savePortfolio}
      />

      <Suspense fallback={null}>
        <AiAnalysisModal
          selectedEmployee={modals.modals.selectedEmployee}
          aiAnalysis={aiAnalysis}
          aiError={aiError}
          isAnalyzing={isAnalyzing}
          isDarkMode={isDarkMode}
          onClose={() => modals.selectEmployee(null)}
        />
      </Suspense>
    </div>
  );
}
