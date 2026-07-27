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
  @MinLength(2)
  @MaxLength(200)
  description!: string;

  @IsNumber()
  @IsPositive()
  @Max(100000)
  quantity!: number;

  @IsNumber()
  @Min(0)
  @Max(1000000)
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
