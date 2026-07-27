import { Transform } from "class-transformer";
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

function trimText({ value }: { value: unknown }) {
  return typeof value === "string" ? value.trim() : value;
}

export class RefineServiceRequestDescriptionDto {
  @Transform(trimText)
  @IsString()
  @MinLength(15)
  @MaxLength(2000)
  currentDescription!: string;

  @Transform(trimText)
  @IsString()
  @MinLength(3)
  @MaxLength(800)
  additionalDetails!: string;

  @IsOptional()
  @Transform(trimText)
  @IsString()
  @MaxLength(40)
  categoryId?: string | null;

  @IsOptional()
  @Transform(trimText)
  @IsString()
  @MaxLength(40)
  serviceId?: string | null;
}
