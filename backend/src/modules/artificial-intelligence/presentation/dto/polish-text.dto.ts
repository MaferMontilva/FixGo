import { Transform } from "class-transformer";
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { PolishTextStyle } from "../../domain/text-polisher";

const POLISH_STYLES: PolishTextStyle[] = ["professional-reply", "budget-observations", "client-review", "generic"];

function trimText({ value }: { value: unknown }) {
  return typeof value === "string" ? value.trim() : value;
}

export class PolishTextDto {
  @Transform(trimText)
  @IsString()
  @MinLength(2, { message: "Escribe al menos 2 caracteres para corregir." })
  @MaxLength(1000, { message: "El texto no puede superar los 1000 caracteres." })
  text!: string;

  @IsOptional()
  @IsIn(POLISH_STYLES)
  style?: PolishTextStyle;
}
