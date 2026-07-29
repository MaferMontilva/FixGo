export type PolishTextStyle =
  | "professional-reply"
  | "budget-observations"
  | "client-review"
  | "generic";

export type PolishTextInput = {
  text: string;
  style?: PolishTextStyle | null;
};

export type PolishTextResult = {
  fallbackUsed: boolean;
  model: string | null;
  provider: "groq" | "local-fallback";
  text: string;
};

export const TEXT_POLISHER = Symbol("TEXT_POLISHER");

export interface TextPolisher {
  polish(input: PolishTextInput): Promise<PolishTextResult>;
}
