import { useCallback } from 'react';
import { User } from 'firebase/auth';
import { collection, addDoc, updateDoc, doc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';
import { Employee, Role, Status, ExpenseType, Currency, CompanyPortfolio } from '../types';
import { handleFirestoreError, OperationType } from '../utils/currency';
import { sanitizeInput } from '../utils/sanitize';

interface UseFirestoreMutationsParams {
  user: User | null;
  subscription: { plan: string } | null;
  portfolio: CompanyPortfolio | null;
  modals: {
    editingEmployee: Employee | null;
  };
  onCloseEmployeeModal: () => void;
  onCloseExpenseModal: () => void;
  onCloseInventoryModal: () => void;
  onCloseRevenueModal: () => void;
  onClosePortfolioModal: () => void;
}

export function useFirestoreMutations({
  user,
  subscription,
  portfolio,
  modals,
  onCloseEmployeeModal,
  onCloseExpenseModal,
  onCloseInventoryModal,
  onCloseRevenueModal,
  onClosePortfolioModal,
}: UseFirestoreMutationsParams) {
  const addEmployee = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    const employeeData = {
      name: sanitizeInput(formData.get('name') as string, 100),
      role: formData.get('role') as Role,
      position: sanitizeInput(formData.get('position') as string, 100),
      section: sanitizeInput(formData.get('section') as string, 100),
      salary: Number(formData.get('salary')),
      status: formData.get('status') as Status,
      performance: Number(formData.get('performance')),
      complaints: Number(formData.get('complaints')),
      medicalCertificatesCount: Number(formData.get('medicalCertificatesCount')),
      area: sanitizeInput(formData.get('area') as string, 100),
      uid: user.uid,
    };
    try {
      if (modals.editingEmployee?.id) {
        await updateDoc(doc(db, 'employees', modals.editingEmployee.id), employeeData);
        toast.success('Funcionário atualizado com sucesso!');
      } else {
        await addDoc(collection(db, 'employees'), employeeData);
        toast.success('Funcionário adicionado com sucesso!');
      }
      onCloseEmployeeModal();
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      handleFirestoreError(error, modals.editingEmployee?.id ? OperationType.UPDATE : OperationType.CREATE, 'employees');
    }
  }, [user, modals.editingEmployee, onCloseEmployeeModal]);

  const deleteEmployee = useCallback(async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este funcionário?')) {
      try {
        await deleteDoc(doc(db, 'employees', id));
        toast.success('Funcionário excluído com sucesso!');
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, 'employees');
      }
    }
  }, []);

  const addExpense = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    const newExpense = {
      type: formData.get('type') as ExpenseType,
      amount: Number(formData.get('amount')),
      currency: formData.get('currency') as Currency,
      date: Timestamp.now(),
      description: sanitizeInput(formData.get('description') as string, 500),
      uid: user.uid,
    };
    try {
      await addDoc(collection(db, 'expenses'), newExpense);
      toast.success('Despesa adicionada com sucesso!');
      onCloseExpenseModal();
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'expenses');
    }
  }, [user, onCloseExpenseModal]);

  const addInventoryItem = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || subscription?.plan !== 'pro') return;
    const formData = new FormData(e.currentTarget);
    const newItem = {
      name: sanitizeInput(formData.get('name') as string, 200),
      quantity: Number(formData.get('quantity')),
      category: sanitizeInput(formData.get('category') as string, 100),
      unitPrice: Number(formData.get('unitPrice')),
      uid: user.uid,
    };
    try {
      await addDoc(collection(db, 'inventory'), newItem);
      toast.success('Item adicionado ao estoque!');
      onCloseInventoryModal();
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'inventory');
    }
  }, [user, subscription, onCloseInventoryModal]);

  const addRevenueRecord = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || subscription?.plan !== 'pro') return;
    const formData = new FormData(e.currentTarget);
    const newRecord = {
      type: formData.get('type') as 'in' | 'out',
      amount: Number(formData.get('amount')),
      category: sanitizeInput(formData.get('category') as string, 100),
      date: Timestamp.now(),
      description: sanitizeInput(formData.get('description') as string, 500),
      uid: user.uid,
    };
    try {
      await addDoc(collection(db, 'revenue'), newRecord);
      toast.success('Registro adicionado com sucesso!');
      onCloseRevenueModal();
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'revenue');
    }
  }, [user, subscription, onCloseRevenueModal]);

  const savePortfolio = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || subscription?.plan !== 'pro') return;
    const formData = new FormData(e.currentTarget);
    const portfolioData = {
      companyName: sanitizeInput(formData.get('companyName') as string, 100),
      tagline: sanitizeInput(formData.get('tagline') as string, 200),
      description: sanitizeInput(formData.get('description') as string, 2000),
      logoUrl: sanitizeInput(formData.get('logoUrl') as string, 500),
      mission: sanitizeInput(formData.get('mission') as string, 1000),
      vision: sanitizeInput(formData.get('vision') as string, 1000),
      values: (formData.get('values') as string).split(',').map(v => sanitizeInput(v.trim(), 100)),
      uid: user.uid,
    };
    try {
      if (portfolio?.id) {
        await updateDoc(doc(db, 'portfolios', portfolio.id), portfolioData);
        toast.success('Portfólio atualizado com sucesso!');
      } else {
        await addDoc(collection(db, 'portfolios'), portfolioData);
        toast.success('Portfólio criado com sucesso!');
      }
      onClosePortfolioModal();
    } catch (error) {
      handleFirestoreError(error, portfolio?.id ? OperationType.UPDATE : OperationType.CREATE, 'portfolios');
    }
  }, [user, subscription, portfolio, onClosePortfolioModal]);

  return { addEmployee, deleteEmployee, addExpense, addInventoryItem, addRevenueRecord, savePortfolio };
}
