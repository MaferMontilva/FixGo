import { ArrayMaxSize, IsArray, IsEmail, IsInt, IsOptional, IsString, IsUrl, Matches, Max, Min, MinLength } from "class-validator";

export class UpdateProfessionalProfileDto {
  @IsString()
  @MinLength(2)
  displayName!: string;

  @IsOptional()
  @IsEmail()
  email?: string | null;

  @IsOptional()
  @IsString()
  businessName?: string | null;

  @IsOptional()
  @Matches(/^\d{9}$/)
  phone?: string | null;

  @IsOptional()
  @IsString()
  document?: string | null;

  @IsOptional()
  @IsString()
  bio?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(70)
  yearsExperience?: number;

  @IsString()
  @MinLength(2)
  province!: string;

  @IsString()
  @MinLength(2)
  municipality!: string;

  @Matches(/^(0[1-9]|[1-4]\d|5[0-2])\d{3}$/)
  postalCode!: string;

  @IsOptional()
  @IsString()
  referenceAddress?: string | null;

  @IsInt()
  @Min(5)
  @Max(100)
  workRadius!: number;

  @IsOptional()
  @IsString()
  availability?: string | null;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  profileImageUrl?: string | null;

  @IsArray()
  @ArrayMaxSize(12)
  @IsInt({ each: true })
  categoryIds!: number[];

  @IsArray()
  @ArrayMaxSize(40)
  @IsInt({ each: true })
  serviceIds!: number[];
}
