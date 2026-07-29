import { Transform } from "class-transformer";
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

function trimText({ value }: { value: unknown }) {
  return typeof value === "string" ? value.trim() : value;
}

export class RefineServiceRequestDescriptionDto {
  @Transform(trimText)
  @IsString()
  @MinLength(15, { message: "La descripcion debe tener al menos 15 caracteres." })
  @MaxLength(2000, { message: "La descripcion no puede superar los 2000 caracteres." })
  currentDescription!: string;

  @Transform(trimText)
  @IsString()
  @MinLength(3, { message: "Los detalles adicionales deben tener al menos 3 caracteres." })
  @MaxLength(800, { message: "Los detalles adicionales no pueden superar los 800 caracteres." })
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
