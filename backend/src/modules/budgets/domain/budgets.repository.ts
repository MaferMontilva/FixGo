import { BudgetEntity } from "./budget.entity";

export const BUDGETS_REPOSITORY = Symbol("BUDGETS_REPOSITORY");

export type CreateBudgetItemData = {
  description: string;
  quantity: number;
  unitPrice: number;
  itemType?: string | null;
};

export type CreateBudgetData = {
  serviceRequestId: number;
  professionalId: number;
  currency: string;
  subtotal: number;
  taxes: number;
  platformFee: number;
  totalPrice: number;
  estimatedDurationValue?: number | null;
  estimatedDurationUnit?: string | null;
  availableFrom?: string | null;
  validUntil?: string | null;
  observations?: string | null;
  items: Array<CreateBudgetItemData & { total: number }>;
};

export type ServiceRequestForBudget = {
  id: number;
  clientUserId: number;
  categoryId: number | null;
  status: string;
  deletedAt: string | null;
};

export abstract class BudgetsRepository {
  abstract findProfessionalIdByUserId(userId: number): Promise<number | null>;
  abstract findServiceRequestForBudget(serviceRequestId: number): Promise<ServiceRequestForBudget | null>;
  abstract professionalHasCategory(professionalId: number, categoryId: number): Promise<boolean>;
  abstract findExistingBudget(serviceRequestId: number, professionalId: number): Promise<BudgetEntity | null>;
  abstract createBudget(data: CreateBudgetData): Promise<BudgetEntity>;
  abstract findBudgetsByProfessionalId(professionalId: number): Promise<BudgetEntity[]>;
  abstract findBudgetsByServiceRequestId(serviceRequestId: number): Promise<BudgetEntity[]>;
}
