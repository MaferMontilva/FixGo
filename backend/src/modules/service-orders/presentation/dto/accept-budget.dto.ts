import { IsInt, IsPositive } from "class-validator";

export class AcceptBudgetDto {
  @IsInt({ message: "El identificador del presupuesto no es valido." })
  @IsPositive({ message: "El identificador del presupuesto no es valido." })
  budgetId!: number;
}
