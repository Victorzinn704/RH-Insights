import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Employee, Expense, InventoryItem, RevenueRecord, Subscription, CompanyPortfolio } from '../types';
import { handleFirestoreError, OperationType } from '../utils/currency';

export interface FirestoreData {
  employees: Employee[];
  expenses: Expense[];
  inventory: InventoryItem[];
  revenue: RevenueRecord[];
  portfolio: CompanyPortfolio | null;
  subscription: Subscription | null;
  isLoading: boolean;
  hasLoadedOnce: boolean;
}

export function useFirestoreData(user: User | null): FirestoreData {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [revenue, setRevenue] = useState<RevenueRecord[]>([]);
  const [portfolio, setPortfolio] = useState<CompanyPortfolio | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    let resolvedCount = 0;
    const totalListeners = 6;

    const markResolved = () => {
      resolvedCount++;
      if (resolvedCount >= totalListeners) {
        setIsLoading(false);
        setHasLoadedOnce(true);
      }
    };

    const qEmployees = query(collection(db, 'employees'), where('uid', '==', user.uid));
    const unsubEmployees = onSnapshot(qEmployees, (snapshot) => {
      setEmployees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee)));
      markResolved();
    }, (error) => { handleFirestoreError(error, OperationType.LIST, 'employees'); markResolved(); });

    const qExpenses = query(collection(db, 'expenses'), where('uid', '==', user.uid), orderBy('date', 'desc'));
    const unsubExpenses = onSnapshot(qExpenses, (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense)));
      markResolved();
    }, (error) => { handleFirestoreError(error, OperationType.LIST, 'expenses'); markResolved(); });

    const qInventory = query(collection(db, 'inventory'), where('uid', '==', user.uid));
    const unsubInventory = onSnapshot(qInventory, (snapshot) => {
      setInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem)));
      markResolved();
    }, (error) => { handleFirestoreError(error, OperationType.LIST, 'inventory'); markResolved(); });

    const qRevenue = query(collection(db, 'revenue'), where('uid', '==', user.uid), orderBy('date', 'desc'));
    const unsubRevenue = onSnapshot(qRevenue, (snapshot) => {
      setRevenue(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RevenueRecord)));
      markResolved();
    }, (error) => { handleFirestoreError(error, OperationType.LIST, 'revenue'); markResolved(); });

    const qPortfolio = query(collection(db, 'portfolios'), where('uid', '==', user.uid));
    const unsubPortfolio = onSnapshot(qPortfolio, (snapshot) => {
      const firstDoc = snapshot.docs[0];
      if (firstDoc) {
        setPortfolio({ id: firstDoc.id, ...firstDoc.data() } as CompanyPortfolio);
      } else {
        setPortfolio(null);
      }
      markResolved();
    }, (error) => { handleFirestoreError(error, OperationType.LIST, 'portfolios'); markResolved(); });

    const qSub = query(collection(db, 'subscriptions'), where('uid', '==', user.uid));
    const unsubSub = onSnapshot(qSub, (snapshot) => {
      const firstSub = snapshot.docs[0];
      if (firstSub) {
        const subData = firstSub.data() as Subscription;
        if (subData.currentPeriodEnd) {
          const endDate = subData.currentPeriodEnd.toDate ? subData.currentPeriodEnd.toDate() : new Date(subData.currentPeriodEnd.seconds * 1000);
          if (endDate < new Date()) {
            setSubscription({ plan: 'free', status: 'canceled', currentPeriodEnd: subData.currentPeriodEnd, uid: user.uid });
            markResolved();
            return;
          }
        }
        setSubscription(subData);
      } else {
        setSubscription({ plan: 'free', status: 'active', currentPeriodEnd: null, uid: user.uid });
      }
      markResolved();
    }, (error) => { handleFirestoreError(error, OperationType.LIST, 'subscriptions'); markResolved(); });

    return () => {
      unsubEmployees();
      unsubExpenses();
      unsubInventory();
      unsubRevenue();
      unsubPortfolio();
      unsubSub();
    };
  }, [user]);

  return { employees, expenses, inventory, revenue, portfolio, subscription, isLoading, hasLoadedOnce };
}
