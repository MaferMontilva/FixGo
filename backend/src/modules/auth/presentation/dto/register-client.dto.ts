import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";

const NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;
const PHONE_REGEX = /^[+]?[\d\s()-]{7,20}$/;
const POSTAL_REGEX = /^[\d A-Za-z-]{3,12}$/;

export class RegisterClientDto {
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

  @IsString()
  @Matches(PHONE_REGEX, { message: "Escribe un telefono valido." })
  phone!: string;

  @IsString()
  @MinLength(4, { message: "La direccion debe tener al menos 4 caracteres." })
  @MaxLength(160)
  addressLine1!: string;

  @IsString()
  @Matches(POSTAL_REGEX, { message: "Escribe un codigo postal valido." })
  postalCode!: string;

  @IsString()
  @MinLength(2, { message: "Escribe tu ciudad o localidad." })
  @MaxLength(120)
  city!: string;
}
