export const PASSWORD_HASHER = Symbol("PASSWORD_HASHER");

export abstract class PasswordHasher {
  abstract hash(value: string): Promise<string>;
  abstract compare(value: string, hash: string): Promise<boolean>;
}
