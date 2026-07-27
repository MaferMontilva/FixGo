import { IsBoolean, IsIn, IsString } from "class-validator";

export class SetUserStatusDto {
  @IsString()
  @IsIn(["ACTIVE", "SUSPENDED", "BLOCKED"])
  status!: string;
}

export class SetProfessionalVerificationDto {
  @IsString()
  @IsIn(["PENDING", "IN_REVIEW", "APPROVED", "REJECTED", "SUSPENDED"])
  verificationStatus!: string;
}

export class SetCategoryActiveDto {
  @IsBoolean()
  isActive!: boolean;
}
