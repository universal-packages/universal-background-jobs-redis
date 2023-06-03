import { RedisQueueOptions as RQOptions } from '@universal-packages/redis-queue'

export interface RedisQueueOptions extends RQOptions {
  globalClient?: string
}
