import { IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

const CATEGORY_CODE_REGEX = /^[A-Za-z0-9_-]+$/;
const CATEGORY_NAME_REGEX = /^[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ.,&' -]+$/;

export class CreateCategoryDto {
  @IsString()
  @MinLength(2, { message: "El codigo debe tener al menos 2 caracteres." })
  @MaxLength(40)
  @Matches(CATEGORY_CODE_REGEX, {
    message: "El codigo solo puede contener letras, numeros, guiones y guiones bajos.",
  })
  code!: string;

  @IsString()
  @MinLength(2, { message: "El nombre debe tener al menos 2 caracteres." })
  @MaxLength(80)
  @Matches(CATEGORY_NAME_REGEX, { message: "El nombre contiene caracteres no permitidos." })
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: "El nombre debe tener al menos 2 caracteres." })
  @MaxLength(80)
  @Matches(CATEGORY_NAME_REGEX, { message: "El nombre contiene caracteres no permitidos." })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;
}
