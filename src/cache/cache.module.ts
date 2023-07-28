import { Module, CacheModule, } from '@nestjs/common';
import { RefreshService } from './cache.service';

@Module({
  imports: [
    CacheModule.register({
      ttl: Number(process.env.CACHE_TTL), // 캐시 유지 시간 (초단위)
      max: Number(process.env.CACHE_MAX), // 캐시 최대 갯수
    }),
  ],
  providers: [RefreshService],
  exports: [RefreshService],
})
export class RtCacheModule {}
