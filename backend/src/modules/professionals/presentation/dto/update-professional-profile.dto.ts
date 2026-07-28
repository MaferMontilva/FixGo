import { ArrayMaxSize, IsArray, IsEmail, IsInt, IsOptional, IsString, IsUrl, Matches, Max, MaxLength, Min, MinLength } from "class-validator";

const DISPLAY_NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;
const BUSINESS_NAME_REGEX = /^[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ.,&' -]+$/;
const PLACE_NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;

export class UpdateProfessionalProfileDto {
  @IsString()
  @MinLength(2, { message: "El nombre debe tener al menos 2 caracteres." })
  @MaxLength(120)
  @Matches(DISPLAY_NAME_REGEX, { message: "El nombre solo puede contener letras." })
  displayName!: string;

  @IsOptional()
  @IsEmail({}, { message: "Escribe un correo electronico valido." })
  email?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: "El nombre del negocio debe tener al menos 2 caracteres." })
  @MaxLength(120)
  @Matches(BUSINESS_NAME_REGEX, {
    message: "El nombre del negocio contiene caracteres no permitidos.",
  })
  businessName?: string | null;

  @IsOptional()
  @IsString()
  @Matches(/^\d{9}$/, { message: "Escribe un telefono valido (9 digitos)." })
  phone?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: "El documento debe tener al menos 2 caracteres." })
  @MaxLength(20)
  document?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: "La biografia no puede superar los 1000 caracteres." })
  bio?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0, { message: "Los anios de experiencia no pueden ser negativos." })
  @Max(70, { message: "Los anios de experiencia no son validos." })
  yearsExperience?: number;

  @IsString()
  @MinLength(2, { message: "La provincia debe tener al menos 2 caracteres." })
  @MaxLength(80)
  @Matches(PLACE_NAME_REGEX, { message: "La provincia solo puede contener letras." })
  province!: string;

  @IsString()
  @MinLength(2, { message: "El municipio debe tener al menos 2 caracteres." })
  @MaxLength(80)
  @Matches(PLACE_NAME_REGEX, { message: "El municipio solo puede contener letras." })
  municipality!: string;

  @IsString()
  @Matches(/^(0[1-9]|[1-4]\d|5[0-2])\d{3}$/, { message: "Escribe un codigo postal valido." })
  postalCode!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  referenceAddress?: string | null;

  @IsInt()
  @Min(5, { message: "El radio de trabajo minimo es 5." })
  @Max(100, { message: "El radio de trabajo maximo es 100." })
  workRadius!: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  availability?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2600000, { message: "La imagen es demasiado grande." })
  @Matches(/^(https?:\/\/|data:image\/)/, { message: "La imagen no es valida." })
  profileImageUrl?: string | null;

  @IsArray()
  @ArrayMaxSize(12)
  @IsInt({ each: true })
  categoryIds!: number[];

  @IsArray()
  @ArrayMaxSize(40)
  @IsInt({ each: true })
  serviceIds!: number[];
}
