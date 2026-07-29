import { httpGet, httpPost } from "../../../shared/http/httpClient";
import type { Budget, CreateBudgetPayload } from "../types/budget";

export function createBudget(payload: CreateBudgetPayload) {
  return httpPost<Budget, CreateBudgetPayload>("/budgets", payload);
}

export function getMyBudgets() {
  return httpGet<Budget[]>("/budgets/mine");
}

export function getRequestBudgets(requestId: number) {
  return httpGet<Budget[]>(`/budgets/request/${requestId}`);
}
