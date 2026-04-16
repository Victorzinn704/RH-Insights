import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { db } from '../firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { Employee, Expense, InventoryItem, RevenueRecord, Subscription } from '../types';

interface ExportDataParams {
  employees: Employee[];
  expenses: Expense[];
  inventory: InventoryItem[];
  revenue: RevenueRecord[];
  portfolio: unknown;
}

export function exportData({ employees, expenses, inventory, revenue, portfolio }: ExportDataParams) {
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
}

interface ImportDataParams {
  user: { uid: string };
  subscription: Subscription | null;
  onImport: () => void;
}

export function importData(
  e: React.ChangeEvent<HTMLInputElement>,
  { user, subscription, onImport }: ImportDataParams
) {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!confirm('Atenção: A importação irá adicionar novos registros ao seu banco de dados atual. Deseja continuar?')) return;

  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      const data = JSON.parse(event.target?.result as string);

      const validRoles = ['Gerente', 'Senior', 'Pleno', 'Junior', 'Estagiário'];
      const validStatuses = ['Disponível', 'Tratamento de Saúde', 'Férias', 'Viagem a Trabalho', 'Na Empresa', 'Home Office', 'Fora de Expediente', 'Atestado'];
      const validExpenseTypes = ['API', 'Cloud', 'Licença', 'Água', 'Luz', 'Internet', 'Outros'];
      const validCurrencies = ['USD', 'EUR', 'BRL'];

      if (data.employees) {
        for (let i = 0; i < data.employees.length; i++) {
          const emp = data.employees[i];
          if (typeof emp.name !== 'string' || !emp.name || emp.name.length >= 100) throw new Error(`Funcionário #${i}: nome inválido`);
          if (!validRoles.includes(emp.role)) throw new Error(`Funcionário #${i}: cargo inválido "${emp.role}"`);
          if (typeof emp.position !== 'string' || emp.position.length >= 100) throw new Error(`Funcionário #${i}: posição inválida`);
          if (typeof emp.section !== 'string' || emp.section.length >= 100) throw new Error(`Funcionário #${i}: seção inválida`);
          if (typeof emp.salary !== 'number' || emp.salary < 0) throw new Error(`Funcionário #${i}: salário inválido`);
          if (!validStatuses.includes(emp.status)) throw new Error(`Funcionário #${i}: status inválido "${emp.status}"`);
          if (typeof emp.performance !== 'number' || emp.performance < 1 || emp.performance > 10) throw new Error(`Funcionário #${i}: desempenho deve ser entre 1 e 10`);
          if (typeof emp.complaints !== 'number' || emp.complaints < 0) throw new Error(`Funcionário #${i}: reclamações inválidas`);
          if (typeof emp.medicalCertificatesCount !== 'number' || emp.medicalCertificatesCount < 0) throw new Error(`Funcionário #${i}: atestados inválidos`);
          if (typeof emp.area !== 'string' || emp.area.length >= 100) throw new Error(`Funcionário #${i}: área inválida`);
        }
      }

      if (data.expenses) {
        for (let i = 0; i < data.expenses.length; i++) {
          const exp = data.expenses[i];
          if (!validExpenseTypes.includes(exp.type)) throw new Error(`Despesa #${i}: tipo inválido "${exp.type}"`);
          if (typeof exp.amount !== 'number' || exp.amount < 0) throw new Error(`Despesa #${i}: valor inválido`);
          if (!validCurrencies.includes(exp.currency)) throw new Error(`Despesa #${i}: moeda inválida "${exp.currency}"`);
          if (typeof exp.description !== 'string' || exp.description.length >= 500) throw new Error(`Despesa #${i}: descrição inválida`);
        }
      }

      if (data.inventory) {
        for (let i = 0; i < data.inventory.length; i++) {
          const item = data.inventory[i];
          if (typeof item.name !== 'string' || !item.name || item.name.length >= 200) throw new Error(`Item #${i}: nome inválido`);
          if (typeof item.quantity !== 'number' || item.quantity < 0) throw new Error(`Item #${i}: quantidade inválida`);
          if (typeof item.category !== 'string' || item.category.length >= 100) throw new Error(`Item #${i}: categoria inválida`);
          if (typeof item.unitPrice !== 'number' || item.unitPrice < 0) throw new Error(`Item #${i}: preço inválido`);
        }
      }

      if (data.revenue) {
        for (let i = 0; i < data.revenue.length; i++) {
          const rev = data.revenue[i];
          if (!['in', 'out'].includes(rev.type)) throw new Error(`Receita #${i}: tipo inválido "${rev.type}"`);
          if (typeof rev.amount !== 'number' || rev.amount < 0) throw new Error(`Receita #${i}: valor inválido`);
          if (typeof rev.category !== 'string' || !rev.category || rev.category.length >= 100) throw new Error(`Receita #${i}: categoria inválida`);
          if (typeof rev.description !== 'string' || rev.description.length >= 500) throw new Error(`Receita #${i}: descrição inválida`);
        }
      }

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

      if (data.employees) {
        for (const emp of data.employees) {
          const { id: _id, ...rest } = emp;
          const docRef = doc(collection(db, 'employees'));
          batch.set(docRef, { ...rest, uid: user.uid });
        }
      }

      if (data.expenses) {
        for (const exp of data.expenses) {
          const { id: _id, ...rest } = exp;
          const docRef = doc(collection(db, 'expenses'));
          batch.set(docRef, { ...rest, uid: user.uid });
        }
      }

      if (data.inventory && subscription?.plan === 'pro') {
        for (const item of data.inventory) {
          const { id: _id, ...rest } = item;
          const docRef = doc(collection(db, 'inventory'));
          batch.set(docRef, { ...rest, uid: user.uid });
        }
      }

      if (data.revenue && subscription?.plan === 'pro') {
        for (const rev of data.revenue) {
          const { id: _id, ...rest } = rev;
          const docRef = doc(collection(db, 'revenue'));
          batch.set(docRef, { ...rest, uid: user.uid });
        }
      }

      await batch.commit();
      toast.success('Importação concluída com sucesso!');
      onImport();
    } catch (error) {
      console.error('Erro na importação:', error);
      toast.error('Erro ao importar arquivo. Verifique se o formato está correto.');
    }
  };
  reader.readAsText(file);
}
