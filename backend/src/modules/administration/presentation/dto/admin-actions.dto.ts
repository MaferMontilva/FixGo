import { IsBoolean, IsEmail, IsIn, IsString, Matches, MaxLength, MinLength } from "class-validator";

const ADMIN_NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;

export class SetUserStatusDto {
  @IsString()
  @IsIn(["ACTIVE", "SUSPENDED", "BLOCKED"], { message: "El estado indicado no es valido." })
  status!: string;
}

export class CreateUserDto {
  @IsString()
  @MinLength(2, { message: "El nombre debe tener al menos 2 caracteres." })
  @MaxLength(80)
  @Matches(ADMIN_NAME_REGEX, { message: "El nombre solo puede contener letras." })
  firstName!: string;

  @IsString()
  @MinLength(2, { message: "El apellido debe tener al menos 2 caracteres." })
  @MaxLength(80)
  @Matches(ADMIN_NAME_REGEX, { message: "El apellido solo puede contener letras." })
  lastName!: string;

  @IsEmail({}, { message: "Escribe un correo electronico valido." })
  email!: string;

  @IsString()
  @MinLength(8, { message: "La clave temporal debe tener al menos 8 caracteres." })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, { message: "La clave debe incluir al menos una letra y un numero." })
  password!: string;

  @IsString()
  @IsIn(["CLIENT", "PROFESSIONAL", "ADMIN"], { message: "Rol no valido." })
  role!: string;
}

export class SetAdminRoleDto {
  @IsBoolean({ message: "El valor debe ser verdadero o falso." })
  grant!: boolean;
}

export class SetProfessionalVerificationDto {
  @IsString()
  @IsIn(["PENDING", "IN_REVIEW", "APPROVED", "REJECTED", "SUSPENDED"], {
    message: "El estado de verificacion indicado no es valido.",
  })
  verificationStatus!: string;
}

export class SetCategoryActiveDto {
  @IsBoolean({ message: "El valor debe ser verdadero o falso." })
  isActive!: boolean;
}
