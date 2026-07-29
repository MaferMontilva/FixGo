import { IsInt, IsOptional, IsPositive, IsString, Max, MaxLength, Min, MinLength } from "class-validator";

export class CreateReviewDto {
  @IsInt()
  @IsPositive()
  serviceOrderId!: number;

  @IsInt({ message: "La valoracion debe ser un numero entero." })
  @Min(1, { message: "La valoracion minima es 1 estrella." })
  @Max(5, { message: "La valoracion maxima es 5 estrellas." })
  rating!: number;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: "El titulo debe tener al menos 2 caracteres." })
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(3, { message: "El comentario debe tener al menos 3 caracteres." })
  @MaxLength(1000, { message: "El comentario no puede superar los 1000 caracteres." })
  comment?: string;
}
