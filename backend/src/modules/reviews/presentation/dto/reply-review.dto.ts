import { IsString, MaxLength, MinLength } from "class-validator";

export class ReplyReviewDto {
  @IsString()
  @MinLength(2, { message: "La respuesta debe tener al menos 2 caracteres." })
  @MaxLength(1000, { message: "La respuesta no puede superar los 1000 caracteres." })
  reply!: string;
}
