import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class CreateReviewDto {
  @IsInt()
  serviceOrderId!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}
