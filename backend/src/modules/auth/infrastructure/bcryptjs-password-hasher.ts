import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { PasswordHasher } from "../domain/password-hasher";

const PASSWORD_COST_FACTOR = 12;

@Injectable()
export class BcryptjsPasswordHasher implements PasswordHasher {
  hash(value: string): Promise<string> {
    return bcrypt.hash(value, PASSWORD_COST_FACTOR);
  }

  compare(value: string, hash: string): Promise<boolean> {
    return bcrypt.compare(value, hash);
  }
}
