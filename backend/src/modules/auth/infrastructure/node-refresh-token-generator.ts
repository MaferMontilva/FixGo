import { randomBytes } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { RefreshTokenGenerator } from "../domain/token-services";

@Injectable()
export class NodeRefreshTokenGenerator implements RefreshTokenGenerator {
  generate(): string {
    return randomBytes(48).toString("base64url");
  }
}
