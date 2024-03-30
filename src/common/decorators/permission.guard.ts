import { CanActivate, ExecutionContext, Injectable, Type } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class PermissionGuard implements CanActivate {
  private permission: string ='';

  constructor(private reflector: Reflector, private moduleRef: ModuleRef) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    console.log(user)
    console.log(this.permission)
    return user.permission === this.permission
  }
  
  setPermissions(permission: string) {
    this.permission = permission;
  }
}

// Guard 생성을 위한 팩토리 함수
export function CheckPermission(permission: string): Type<CanActivate> {
  @Injectable()
  class MixinPermissionsGuard extends PermissionGuard {
    constructor(reflector: Reflector, moduleRef: ModuleRef) {
      super(reflector, moduleRef);
      this.setPermissions(permission);
    }
  }

  return MixinPermissionsGuard;
}
