import { Transform } from "class-transformer";
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

function trimNullableText({ value }: { value: unknown }) {
  if (typeof value !== "string") return value;

  const normalizedValue = value.trim();
  return normalizedValue ? normalizedValue : null;
}

export class CancelServiceRequestDto {
  @IsOptional()
  @Transform(trimNullableText)
  @IsString()
  @MinLength(3, { message: "El motivo debe tener al menos 3 caracteres." })
  @MaxLength(500, { message: "El motivo no puede superar los 500 caracteres." })
  reason?: string | null;
}
