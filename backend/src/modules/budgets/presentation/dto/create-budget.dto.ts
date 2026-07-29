import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested
} from "class-validator";

export class CreateBudgetItemDto {
  @IsString()
  @MinLength(2, { message: "La descripcion debe tener al menos 2 caracteres." })
  @MaxLength(200)
  description!: string;

  @IsNumber({}, { message: "La cantidad debe ser un numero." })
  @IsPositive({ message: "La cantidad debe ser mayor que 0." })
  @Max(100000, { message: "La cantidad no puede superar 100000." })
  quantity!: number;

  @IsNumber({}, { message: "El precio debe ser un numero." })
  @IsPositive({ message: "El precio debe ser mayor que 0." })
  @Max(1000000, { message: "El precio no puede superar 1000000." })
  unitPrice!: number;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  itemType?: string;
}

export class CreateBudgetDto {
  @IsInt()
  @IsPositive()
  serviceRequestId!: number;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => CreateBudgetItemDto)
  items!: CreateBudgetItemDto[];

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observations?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Max(3650)
  estimatedDurationValue?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  estimatedDurationUnit?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  availableFrom?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  validUntil?: string;
}
