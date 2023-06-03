import { JobItem, LaterOptions, QueueInterface } from '@universal-packages/background-jobs'
import { RedisQueue as RQ } from '@universal-packages/redis-queue'

import { RedisQueueOptions } from './RedisQueue.types'

export default class RedisQueue implements QueueInterface {
  public readonly options: RedisQueueOptions

  private redisQueue: RQ

  public constructor(options?: RedisQueueOptions) {
    this.options = { identifier: 'background-jobs', ...options }

    const client = global[this.options.globalClient] || this.options.client

    this.redisQueue = new RQ({ ...this.options, client })
  }

  public async prepare(): Promise<void> {
    await this.redisQueue.connect()
  }

  public async release(): Promise<void> {
    await this.redisQueue.disconnect()
  }

  public async clear(): Promise<void> {
    await this.redisQueue.clear()
  }

  public async enqueue(item: JobItem, queue: string, options?: LaterOptions): Promise<void> {
    await this.redisQueue.enqueue(item, queue, options)
  }

  public async dequeue(queue: string): Promise<JobItem> {
    const inQueue = await this.redisQueue.dequeue(queue)

    if (inQueue) return inQueue.payload as JobItem
  }
}
