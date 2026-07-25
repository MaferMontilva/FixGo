import { Transform } from "class-transformer";
import { IsOptional, IsString, MaxLength } from "class-validator";

function trimNullableText({ value }: { value: unknown }) {
  if (typeof value !== "string") return value;

  const normalizedValue = value.trim();
  return normalizedValue ? normalizedValue : null;
}

export class CancelServiceRequestDto {
  @IsOptional()
  @Transform(trimNullableText)
  @IsString()
  @MaxLength(500)
  reason?: string | null;
}
