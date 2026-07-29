import { IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

const DISPLAY_NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;

export class UpdateMyClientProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: "El nombre debe tener al menos 2 caracteres." })
  @MaxLength(120)
  @Matches(DISPLAY_NAME_REGEX, { message: "El nombre solo puede contener letras." })
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
