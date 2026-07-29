import { Inject, Injectable } from "@nestjs/common";
import { PolishTextInput, PolishTextResult, TEXT_POLISHER, TextPolisher } from "../domain/text-polisher";

@Injectable()
export class PolishTextUseCase {
  constructor(
    @Inject(TEXT_POLISHER)
    private readonly polisher: TextPolisher
  ) {}

  execute(input: PolishTextInput): Promise<PolishTextResult> {
    return this.polisher.polish(input);
  }
}
