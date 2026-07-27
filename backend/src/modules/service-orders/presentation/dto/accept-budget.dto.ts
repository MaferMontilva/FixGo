import { IsInt, IsPositive } from "class-validator";

export class AcceptBudgetDto {
  @IsInt()
  @IsPositive()
  budgetId!: number;
}
