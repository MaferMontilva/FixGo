import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";

const NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;

export class ResetPasswordDto {
  @IsString()
  @MinLength(2, { message: "El nombre debe tener al menos 2 caracteres." })
  @MaxLength(80)
  @Matches(NAME_REGEX, { message: "El nombre solo puede contener letras." })
  firstName!: string;

  @IsString()
  @MinLength(2, { message: "El apellido debe tener al menos 2 caracteres." })
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
}
