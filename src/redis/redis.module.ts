import { Module } from '@nestjs/common';
import {CacheModule} from '@nestjs/common/cache'
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from "cache-manager-redis-store";


@Module({
    imports: [
        CacheModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                return {
                    store: redisStore,
                    host: configService.get<string>('REDIS_HOST'),
                    port: configService.get<number>('REDIS_PORT'),
                    ttl: configService.get<number>('REDIS_TTL'),
                };
            },
            isGlobal: true,
        }),
    ],
    
})
export class RedisModule {}