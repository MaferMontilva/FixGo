import { IsIn } from "class-validator";

export const DISMISS_REASONS = ["TOO_EXPENSIVE", "TOO_FAR", "OUT_OF_SERVICE", "BUSY", "OTHER"] as const;

export class DismissOpportunityDto {
  @IsIn(DISMISS_REASONS, { message: "Motivo de descarte no válido." })
  reason!: (typeof DISMISS_REASONS)[number];
}
