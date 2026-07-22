import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateMyClientProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
