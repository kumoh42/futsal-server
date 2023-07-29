import { Injectable, CacheStore, CACHE_MANAGER, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RefreshService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async saveRefreshToken(RT: string, user_id: string): Promise<void> {
    await this.cache.store.set(RT, user_id);
  }

  async getRefreshToken(RT: string): Promise<string | undefined> {
    // 리프레시 토큰을 캐시에서 가져옵니다.
    return await this.cache.store.get<string>(RT);
  }

  async deleteRefreshToken(user_id: string): Promise<void> {
    await this.cache.store.del(user_id);
  }

  async getAllKeys(): Promise<string[] | null> {
    return await this.cache.store.keys();
  }
}
