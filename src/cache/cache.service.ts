import { Injectable, CACHE_MANAGER, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async save(key: string, value: string): Promise<void> {
    await this.cache.store.set(key, value);
  }

  async getByKey<T>(key: string): Promise<T> {
    return await this.cache.store.get<T>(key);
  }

  async delete(key: string): Promise<void> {
    await this.cache.store.del(key);
  }

  async getAllKeys(): Promise<string[] | null> {
    return await this.cache.store.keys();
  }
}
