import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto {
  @IsEmail({}, { message: "Escribe un correo electronico valido." })
  email!: string;

  @IsString()
  @MinLength(1, { message: "La contrasena es obligatoria." })
  password!: string;
}
