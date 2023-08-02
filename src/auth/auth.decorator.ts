
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserLoginAccount = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const user_id: string = ctx.switchToHttp().getRequest().body.user_id;
    const user_password: string = ctx.switchToHttp().getRequest().body.user_password;  
    return {user_id, user_password};
  },
);