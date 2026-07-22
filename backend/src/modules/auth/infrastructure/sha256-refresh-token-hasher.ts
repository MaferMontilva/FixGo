import { createHash } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { RefreshTokenHasher } from "../domain/token-services";

@Injectable()
export class Sha256RefreshTokenHasher implements RefreshTokenHasher {
  hash(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }
}
