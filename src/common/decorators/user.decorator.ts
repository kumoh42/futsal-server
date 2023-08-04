
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type User = {
  userId: string,
  userName: string
}

export const User = createParamDecorator(
  (data: unknown,
   ctx: ExecutionContext) => {
    const {userId, userName} = ctx.
                              switchToHttp().
                              getRequest().
                              user;
    return {userId, userName};
  },
);
