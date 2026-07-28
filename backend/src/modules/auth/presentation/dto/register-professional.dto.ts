import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

const NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;
const BUSINESS_NAME_REGEX = /^[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ.,&' -]+$/;
const PHONE_REGEX = /^[+]?[\d\s()-]{7,20}$/;

export class RegisterProfessionalDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  @Matches(NAME_REGEX, { message: "El nombre solo puede contener letras." })
  firstName!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  @Matches(NAME_REGEX, { message: "El apellido solo puede contener letras." })
  lastName!: string;

  @IsEmail({}, { message: "Escribe un correo electronico valido." })
  email!: string;

  @IsString()
  @MinLength(8, { message: "La contrasena debe tener al menos 8 caracteres." })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: "La contrasena debe incluir al menos una letra y un numero.",
  })
  password!: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: "El nombre del negocio debe tener al menos 2 caracteres." })
  @MaxLength(120)
  @Matches(BUSINESS_NAME_REGEX, {
    message: "El nombre del negocio contiene caracteres no permitidos.",
  })
  businessName?: string;

  @IsOptional()
  @IsString()
  @Matches(PHONE_REGEX, { message: "Escribe un telefono valido." })
  phone?: string;
}
