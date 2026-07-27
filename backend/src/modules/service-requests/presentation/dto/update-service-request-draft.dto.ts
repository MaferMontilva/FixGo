import { Transform, Type } from "class-transformer";
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength
} from "class-validator";
import { SERVICE_REQUEST_URGENCY } from "../../domain/service-request.entity";

const DATE_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function trimText({ value }: { value: unknown }) {
  return typeof value === "string" ? value.trim() : value;
}

export class UpdateServiceRequestDraftDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId?: number;

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

  @IsOptional()
  @Transform(trimText)
  @IsString()
  @MinLength(15)
  @MaxLength(2000)
  originalDescription?: string;

  @IsOptional()
  @Transform(trimText)
  @IsString()
  @MinLength(3)
  @MaxLength(240)
  locationDescription?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{5}$/)
  postalCode?: string;

  @IsOptional()
  @IsIn(Object.values(SERVICE_REQUEST_URGENCY))
  urgency?: "LOW" | "NORMAL" | "HIGH" | "EMERGENCY";

  @IsOptional()
  @IsString()
  @Matches(DATE_INPUT_PATTERN)
  preferredDateFrom?: string | null;

  @IsOptional()
  @IsString()
  @Matches(DATE_INPUT_PATTERN)
  preferredDateTo?: string | null;

  @IsOptional()
  @IsBoolean()
  flexibleSchedule?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  budgetMin?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  budgetMax?: number | null;

  @IsOptional()
  @IsBoolean()
  aiAssisted?: boolean;
}
