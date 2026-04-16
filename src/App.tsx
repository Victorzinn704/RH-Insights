import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './contexts/AppContext';
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

function AppContent() {
  const {
    user,
    loading,
    handleLogin,
    handleLogout,
    isDarkMode,
    toggleDarkMode,
    portfolio,
    subscription,
    modals,
    closeEmployeeModal,
    closeExpenseModal,
    closeInventoryModal,
    closeRevenueModal,
    closePortfolioModal,
    addEmployee,
    addExpense,
    addInventoryItem,
    addRevenueRecord,
    savePortfolio,
    aiAnalysis,
    aiError,
    isAnalyzing,
    selectEmployee,
  } = useAppContext();

  if (loading) return <div className="h-screen flex items-center justify-center bg-zinc-50">Carregando...</div>;
  if (!user) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#09090b] text-zinc-100' : 'bg-[#f8fafc] text-slate-900'} font-sans flex`}>
      <Sidebar
        user={user}
        portfolio={portfolio}
        subscription={subscription}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onLogout={handleLogout}
      />

      <main className="flex-1 overflow-y-auto p-10">
        <Routes>
          <Route path="/" element={
            <Suspense fallback={<LoadingTab />}>
              <DashboardTab />
            </Suspense>
          } />
          <Route path="/employees" element={
            <Suspense fallback={<LoadingTab />}>
              <EmployeesTab />
            </Suspense>
          } />
          <Route path="/expenses" element={
            <Suspense fallback={<LoadingTab />}>
              <ExpensesTab />
            </Suspense>
          } />
          <Route path="/ai" element={
            <Suspense fallback={<LoadingTab />}>
              <AiTab />
            </Suspense>
          } />
          <Route path="/pro" element={
            <Suspense fallback={<LoadingTab />}>
              <ProTab />
            </Suspense>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Suspense fallback={null}>
        <EmployeeFormModal
          isOpen={modals.isEmployeeModalOpen}
          editingEmployee={modals.editingEmployee}
          isDarkMode={isDarkMode}
          onClose={closeEmployeeModal}
          onSubmit={addEmployee}
        />
      </Suspense>

      <Suspense fallback={null}>
        <ExpenseFormModal
          isOpen={modals.isExpenseModalOpen}
          isDarkMode={isDarkMode}
          onClose={closeExpenseModal}
          onSubmit={addExpense}
        />
      </Suspense>

      <InventoryFormModal
        isOpen={modals.isInventoryModalOpen}
        isDarkMode={isDarkMode}
        onClose={closeInventoryModal}
        onSubmit={addInventoryItem}
      />

      <RevenueFormModal
        isOpen={modals.isRevenueModalOpen}
        isDarkMode={isDarkMode}
        onClose={closeRevenueModal}
        onSubmit={addRevenueRecord}
      />

      <PortfolioFormModal
        isOpen={modals.isPortfolioModalOpen}
        portfolio={portfolio}
        isDarkMode={isDarkMode}
        onClose={closePortfolioModal}
        onSubmit={savePortfolio}
      />

      <Suspense fallback={null}>
        <AiAnalysisModal
          selectedEmployee={modals.selectedEmployee}
          aiAnalysis={aiAnalysis}
          aiError={aiError}
          isAnalyzing={isAnalyzing}
          isDarkMode={isDarkMode}
          onClose={() => selectEmployee(null)}
        />
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
}
