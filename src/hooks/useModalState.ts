import { useReducer, useCallback } from 'react';
import { Employee } from '../types';

interface ModalState {
  isEmployeeModalOpen: boolean;
  isExpenseModalOpen: boolean;
  isInventoryModalOpen: boolean;
  isRevenueModalOpen: boolean;
  isPortfolioModalOpen: boolean;
  editingEmployee: Employee | null;
  selectedEmployee: Employee | null;
  isProMenuOpen: boolean;
  activeProSubTab: 'inventory' | 'portfolio' | 'revenue';
}

type ModalAction =
  | { type: 'OPEN_EMPLOYEE_MODAL'; employee?: Employee | null }
  | { type: 'CLOSE_EMPLOYEE_MODAL' }
  | { type: 'OPEN_EXPENSE_MODAL' }
  | { type: 'CLOSE_EXPENSE_MODAL' }
  | { type: 'OPEN_INVENTORY_MODAL' }
  | { type: 'CLOSE_INVENTORY_MODAL' }
  | { type: 'OPEN_REVENUE_MODAL' }
  | { type: 'CLOSE_REVENUE_MODAL' }
  | { type: 'OPEN_PORTFOLIO_MODAL' }
  | { type: 'CLOSE_PORTFOLIO_MODAL' }
  | { type: 'SELECT_EMPLOYEE'; employee: Employee | null }
  | { type: 'TOGGLE_PRO_MENU' }
  | { type: 'SET_PRO_SUB_TAB'; subTab: 'inventory' | 'portfolio' | 'revenue' };

const initialState: ModalState = {
  isEmployeeModalOpen: false,
  isExpenseModalOpen: false,
  isInventoryModalOpen: false,
  isRevenueModalOpen: false,
  isPortfolioModalOpen: false,
  editingEmployee: null,
  selectedEmployee: null,
  isProMenuOpen: false,
  activeProSubTab: 'revenue',
};

function modalReducer(state: ModalState, action: ModalAction): ModalState {
  switch (action.type) {
    case 'OPEN_EMPLOYEE_MODAL':
      return { ...state, isEmployeeModalOpen: true, editingEmployee: action.employee ?? null };
    case 'CLOSE_EMPLOYEE_MODAL':
      return { ...state, isEmployeeModalOpen: false, editingEmployee: null };
    case 'OPEN_EXPENSE_MODAL':
      return { ...state, isExpenseModalOpen: true };
    case 'CLOSE_EXPENSE_MODAL':
      return { ...state, isExpenseModalOpen: false };
    case 'OPEN_INVENTORY_MODAL':
      return { ...state, isInventoryModalOpen: true };
    case 'CLOSE_INVENTORY_MODAL':
      return { ...state, isInventoryModalOpen: false };
    case 'OPEN_REVENUE_MODAL':
      return { ...state, isRevenueModalOpen: true };
    case 'CLOSE_REVENUE_MODAL':
      return { ...state, isRevenueModalOpen: false };
    case 'OPEN_PORTFOLIO_MODAL':
      return { ...state, isPortfolioModalOpen: true };
    case 'CLOSE_PORTFOLIO_MODAL':
      return { ...state, isPortfolioModalOpen: false };
    case 'SELECT_EMPLOYEE':
      return { ...state, selectedEmployee: action.employee };
    case 'TOGGLE_PRO_MENU':
      return { ...state, isProMenuOpen: !state.isProMenuOpen };
    case 'SET_PRO_SUB_TAB':
      return { ...state, activeProSubTab: action.subTab };
    default:
      return state;
  }
}

export interface UseModalStateReturn {
  modals: ModalState;
  openEmployeeModal: (employee?: Employee | null) => void;
  closeEmployeeModal: () => void;
  openExpenseModal: () => void;
  closeExpenseModal: () => void;
  openInventoryModal: () => void;
  closeInventoryModal: () => void;
  openRevenueModal: () => void;
  closeRevenueModal: () => void;
  openPortfolioModal: () => void;
  closePortfolioModal: () => void;
  selectEmployee: (employee: Employee | null) => void;
  toggleProMenu: () => void;
  setProSubTab: (subTab: 'inventory' | 'portfolio' | 'revenue') => void;
}

export function useModalState(): UseModalStateReturn {
  const [modals, dispatch] = useReducer(modalReducer, initialState);

  return {
    modals,
    openEmployeeModal: useCallback((employee?: Employee | null) =>
      dispatch({ type: 'OPEN_EMPLOYEE_MODAL', employee }), []),
    closeEmployeeModal: useCallback(() =>
      dispatch({ type: 'CLOSE_EMPLOYEE_MODAL' }), []),
    openExpenseModal: useCallback(() =>
      dispatch({ type: 'OPEN_EXPENSE_MODAL' }), []),
    closeExpenseModal: useCallback(() =>
      dispatch({ type: 'CLOSE_EXPENSE_MODAL' }), []),
    openInventoryModal: useCallback(() =>
      dispatch({ type: 'OPEN_INVENTORY_MODAL' }), []),
    closeInventoryModal: useCallback(() =>
      dispatch({ type: 'CLOSE_INVENTORY_MODAL' }), []),
    openRevenueModal: useCallback(() =>
      dispatch({ type: 'OPEN_REVENUE_MODAL' }), []),
    closeRevenueModal: useCallback(() =>
      dispatch({ type: 'CLOSE_REVENUE_MODAL' }), []),
    openPortfolioModal: useCallback(() =>
      dispatch({ type: 'OPEN_PORTFOLIO_MODAL' }), []),
    closePortfolioModal: useCallback(() =>
      dispatch({ type: 'CLOSE_PORTFOLIO_MODAL' }), []),
    selectEmployee: useCallback((employee: Employee | null) =>
      dispatch({ type: 'SELECT_EMPLOYEE', employee }), []),
    toggleProMenu: useCallback(() =>
      dispatch({ type: 'TOGGLE_PRO_MENU' }), []),
    setProSubTab: useCallback((subTab: 'inventory' | 'portfolio' | 'revenue') =>
      dispatch({ type: 'SET_PRO_SUB_TAB', subTab }), []),
  };
}
