import { Worker } from '@universal-packages/background-jobs'
import { Measurement, sleep } from '@universal-packages/time-measurer'

import { RedisQueue } from '../src'
import FailingJob from './__fixtures__/failing/Failing.job'
import ExcellentJob from './__fixtures__/jobs/Excellent.job'
import GoodJob from './__fixtures__/jobs/Good.job'
import PriorityAJob from './__fixtures__/priority/PriorityA.job'
import PriorityBJob from './__fixtures__/priority/PriorityB.job'

describe(RedisQueue, (): void => {
  it('works with the worker', async (): Promise<void> => {
    const queue = new RedisQueue()
    const worker = new Worker({ jobsLocation: './tests/__fixtures__/jobs', queue, waitTimeIfEmptyRound: 0 })

    await worker.prepare()
    await worker.queue.clear()

    await GoodJob.performLater({ good: true })
    await ExcellentJob.performLater({ excellent: true })

    await worker.run()

    await sleep(200)

    await worker.stop()
    await worker.release()

    expect(GoodJob.performJestFn).toHaveBeenCalledWith({ good: true })
    expect(ExcellentJob.performJestFn).toHaveBeenCalledWith({ excellent: true })
  })

  it('works with prioritization', async (): Promise<void> => {
    const performedMock = jest.fn()
    const queue = new RedisQueue()
    const worker = new Worker({ jobsLocation: './tests/__fixtures__/priority', queue, waitTimeIfEmptyRound: 0, queuePriority: { low: 1, high: 3 } })

    await worker.prepare()
    await worker.queue.clear()

    worker.on('performed', performedMock)

    await PriorityAJob.performLater({ A: true })
    await PriorityAJob.performLater({ A: true })
    await PriorityAJob.performLater({ A: true })
    await PriorityBJob.performLater({ B: true })
    await PriorityBJob.performLater({ B: true })
    await PriorityBJob.performLater({ B: true })
    await PriorityBJob.performLater({ B: true })

    await worker.run()

    await sleep(1000)

    await worker.stop()
    await worker.release()

    expect(performedMock.mock.calls).toEqual([
      [{ jobItem: expect.objectContaining({ name: 'PriorityAJob' }), measurement: expect.any(Measurement) }],
      [{ jobItem: expect.objectContaining({ name: 'PriorityBJob' }), measurement: expect.any(Measurement) }],
      [{ jobItem: expect.objectContaining({ name: 'PriorityBJob' }), measurement: expect.any(Measurement) }],
      [{ jobItem: expect.objectContaining({ name: 'PriorityBJob' }), measurement: expect.any(Measurement) }],
      [{ jobItem: expect.objectContaining({ name: 'PriorityAJob' }), measurement: expect.any(Measurement) }],
      [{ jobItem: expect.objectContaining({ name: 'PriorityBJob' }), measurement: expect.any(Measurement) }],
      [{ jobItem: expect.objectContaining({ name: 'PriorityAJob' }), measurement: expect.any(Measurement) }]
    ])
  })

  it('works with failure retries', async (): Promise<void> => {
    const retryMock = jest.fn()
    const failedMock = jest.fn()
    const queue = new RedisQueue()
    const worker = new Worker({ jobsLocation: './tests/__fixtures__/failing', queue, waitTimeIfEmptyRound: 0 })

    await worker.prepare()
    await worker.queue.clear()

    worker.on('retry', retryMock)
    worker.on('failed', failedMock)

    await FailingJob.performLater()

    await worker.run()

    await sleep(3500)

    await worker.stop()
    await worker.release()

    expect(retryMock.mock.calls).toEqual([
      [
        {
          jobItem: expect.objectContaining({
            name: 'FailingJob',
            maxRetries: 3,
            queue: 'default',
            retryAfter: '1 second',
            error: {
              message: 'Job "perform" method not implemented',
              stack: expect.any(String)
            },
            retries: 1
          }),
          measurement: expect.any(Measurement)
        }
      ],
      [
        {
          jobItem: expect.objectContaining({
            name: 'FailingJob',
            maxRetries: 3,
            queue: 'default',
            retryAfter: '1 second',
            error: {
              message: 'Job "perform" method not implemented',
              stack: expect.any(String)
            },
            retries: 2
          }),
          measurement: expect.any(Measurement)
        }
      ],
      [
        {
          jobItem: expect.objectContaining({
            name: 'FailingJob',
            maxRetries: 3,
            queue: 'default',
            retryAfter: '1 second',
            error: {
              message: 'Job "perform" method not implemented',
              stack: expect.any(String)
            },
            retries: 3
          }),
          measurement: expect.any(Measurement)
        }
      ]
    ])
    expect(failedMock.mock.calls).toEqual([
      [
        {
          jobItem: expect.objectContaining({
            name: 'FailingJob',
            maxRetries: 3,
            queue: 'default',
            retryAfter: '1 second',
            error: {
              message: 'Job "perform" method not implemented',
              stack: expect.any(String)
            },
            retries: 3
          }),
          measurement: expect.any(Measurement)
        }
      ]
    ])
  })
})
