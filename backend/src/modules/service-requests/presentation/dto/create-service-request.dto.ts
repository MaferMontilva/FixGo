import { Transform, Type } from "class-transformer";
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength
} from "class-validator";
import { SERVICE_REQUEST_URGENCY } from "../../domain/service-request.entity";

const DATE_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_BUDGET_AMOUNT = 1000000;

function trimText({ value }: { value: unknown }) {
  return typeof value === "string" ? value.trim() : value;
}

export class CreateServiceRequestDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  serviceId?: number | null;

  @IsOptional()
  @Transform(trimText)
  @IsString()
  @MaxLength(120)
  title?: string | null;

  @Transform(trimText)
  @IsString()
  @MinLength(15, { message: "La descripcion debe tener al menos 15 caracteres." })
  @MaxLength(2000, { message: "La descripcion no puede superar los 2000 caracteres." })
  originalDescription!: string;

  @Transform(trimText)
  @IsString()
  @MinLength(3, { message: "La ubicacion debe tener al menos 3 caracteres." })
  @MaxLength(240)
  locationDescription!: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{5}$/, { message: "Escribe un codigo postal valido." })
  postalCode?: string;

  @IsIn(Object.values(SERVICE_REQUEST_URGENCY), { message: "La urgencia indicada no es valida." })
  urgency!: "LOW" | "NORMAL" | "HIGH" | "EMERGENCY";

  @IsOptional()
  @IsString()
  @Matches(DATE_INPUT_PATTERN, { message: "La fecha no es valida." })
  preferredDateFrom?: string | null;

  @IsOptional()
  @IsString()
  @Matches(DATE_INPUT_PATTERN, { message: "La fecha no es valida." })
  preferredDateTo?: string | null;

  @IsBoolean()
  flexibleSchedule!: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "El presupuesto debe ser un numero." })
  @Min(0.01, { message: "El presupuesto debe ser mayor que 0." })
  @Max(MAX_BUDGET_AMOUNT, { message: "El presupuesto no puede superar 1000000." })
  budgetMin?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "El presupuesto debe ser un numero." })
  @Min(0.01, { message: "El presupuesto debe ser mayor que 0." })
  @Max(MAX_BUDGET_AMOUNT, { message: "El presupuesto no puede superar 1000000." })
  budgetMax?: number | null;

  @IsOptional()
  @IsBoolean()
  aiAssisted?: boolean;
}
