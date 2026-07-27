import { Transform } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from "class-validator";
import { SERVICE_REQUEST_URGENCY } from "../../../service-requests/domain/service-request.entity";

function trimText({ value }: { value: unknown }) {
  return typeof value === "string" ? value.trim() : value;
}

export class AnalyzeServiceRequestDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  categoryId?: number | null;

  @IsOptional()
  @Transform(trimText)
  @IsString()
  @MaxLength(80)
  categoryName?: string | null;

  @Transform(trimText)
  @IsString()
  @MinLength(15)
  @MaxLength(2000)
  description!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  serviceId?: number | null;

  @IsOptional()
  @Transform(trimText)
  @IsString()
  @MaxLength(80)
  serviceName?: string | null;

  @IsOptional()
  @Transform(trimText)
  @IsString()
  @MaxLength(120)
  title?: string | null;

  @IsOptional()
  @IsIn(Object.values(SERVICE_REQUEST_URGENCY))
  urgency?: "LOW" | "NORMAL" | "HIGH" | "EMERGENCY" | null;
}
