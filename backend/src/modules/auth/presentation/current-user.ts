import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export type RequestUser = {
  id: number;
  email: string | null;
  roles: string[];
};

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext): RequestUser => {
  const request = context.switchToHttp().getRequest<{ user: RequestUser }>();
  return request.user;
});
