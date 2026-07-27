import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateCategoryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  code!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;
}
