import { getFunctions, httpsCallable } from "firebase/functions";
import { Employee } from "../types";

const functions = getFunctions();

async function callAI(
  type: "analyze" | "strategic",
  payload: unknown
): Promise<string> {
  const aiProxy = httpsCallable<{ type: string; payload: unknown }, { result: string }>(
    functions,
    "aiProxy"
  );

  const response = await aiProxy({ type, payload });
  return response.data.result;
}

export async function analyzeEmployeePerformance(employee: Employee) {
  return callAI("analyze", {
    name: employee.name,
    role: employee.role,
    position: employee.position,
    area: employee.area,
    performance: employee.performance,
    complaints: employee.complaints,
    medicalCertificatesCount: employee.medicalCertificatesCount,
    status: employee.status,
  });
}

export async function getStrategicDecision(
  employees: Employee[],
  expenses: unknown[]
) {
  return callAI("strategic", {
    employeeCount: employees.length,
    expenseCount: expenses.length,
    employees: employees.map((e) => ({
      name: e.name,
      role: e.role,
      performance: e.performance,
      medicalCertificatesCount: e.medicalCertificatesCount,
    })),
  });
}
