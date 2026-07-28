import { IsString, Matches, MinLength } from "class-validator";

export class ChangePasswordDto {
  @IsString()
  @MinLength(8, { message: "La contrasena debe tener al menos 8 caracteres." })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: "La contrasena debe incluir al menos una letra y un numero.",
  })
  password!: string;
}
