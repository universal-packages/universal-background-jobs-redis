import { BackgroundJobs } from '@universal-packages/background-jobs'
import { Measurement, sleep } from '@universal-packages/time-measurer'

import { RedisQueue } from '../src'
import FailingJob from './__fixtures__/failing/Failing.job'
import ExcellentJob from './__fixtures__/jobs/Excellent.job'
import GoodJob from './__fixtures__/jobs/Good.job'
import PriorityAJob from './__fixtures__/priority/PriorityA.job'
import PriorityBJob from './__fixtures__/priority/PriorityB.job'

describe(RedisQueue, (): void => {
  it('works with jobs', async (): Promise<void> => {
    const queue = new RedisQueue()
    const backgroundJobs = new BackgroundJobs({ jobsLocation: './tests/__fixtures__/jobs', queue, waitTimeIfEmptyRound: 0 })

    await backgroundJobs.prepare()
    await backgroundJobs.queue.clear()

    await GoodJob.performLater({ good: true })
    await ExcellentJob.performLater({ excellent: true })

    await backgroundJobs.run()

    await sleep(200)

    await backgroundJobs.stop()
    await backgroundJobs.release()

    expect(GoodJob.performJestFn).toHaveBeenCalledWith({ good: true })
    expect(ExcellentJob.performJestFn).toHaveBeenCalledWith({ excellent: true })
  })

  it('works with prioritization', async (): Promise<void> => {
    const performedMock = jest.fn()
    const queue = new RedisQueue()
    const backgroundJobs = new BackgroundJobs({ jobsLocation: './tests/__fixtures__/priority', queue, waitTimeIfEmptyRound: 0, queuePriority: { low: 1, high: 3 } })

    await backgroundJobs.prepare()
    await backgroundJobs.queue.clear()

    backgroundJobs.on('performed', performedMock)

    await PriorityAJob.performLater({ A: true })
    await PriorityAJob.performLater({ A: true })
    await PriorityAJob.performLater({ A: true })
    await PriorityBJob.performLater({ B: true })
    await PriorityBJob.performLater({ B: true })
    await PriorityBJob.performLater({ B: true })
    await PriorityBJob.performLater({ B: true })

    await backgroundJobs.run()

    await sleep(1000)

    await backgroundJobs.stop()
    await backgroundJobs.release()

    expect(performedMock.mock.calls).toEqual([
      [{ event: 'performed', measurement: expect.any(Measurement), payload: { jobItem: expect.objectContaining({ name: 'PriorityAJob' }) } }],
      [{ event: 'performed', measurement: expect.any(Measurement), payload: { jobItem: expect.objectContaining({ name: 'PriorityBJob' }) } }],
      [{ event: 'performed', measurement: expect.any(Measurement), payload: { jobItem: expect.objectContaining({ name: 'PriorityBJob' }) } }],
      [{ event: 'performed', measurement: expect.any(Measurement), payload: { jobItem: expect.objectContaining({ name: 'PriorityBJob' }) } }],
      [{ event: 'performed', measurement: expect.any(Measurement), payload: { jobItem: expect.objectContaining({ name: 'PriorityAJob' }) } }],
      [{ event: 'performed', measurement: expect.any(Measurement), payload: { jobItem: expect.objectContaining({ name: 'PriorityBJob' }) } }],
      [{ event: 'performed', measurement: expect.any(Measurement), payload: { jobItem: expect.objectContaining({ name: 'PriorityAJob' }) } }]
    ])
  })

  it('works with failure retries', async (): Promise<void> => {
    const retryMock = jest.fn()
    const failedMock = jest.fn()
    const queue = new RedisQueue()
    const backgroundJobs = new BackgroundJobs({ jobsLocation: './tests/__fixtures__/failing', queue, waitTimeIfEmptyRound: 0 })

    await backgroundJobs.prepare()
    await backgroundJobs.queue.clear()

    backgroundJobs.on('retry', retryMock)
    backgroundJobs.on('failed', failedMock)

    await FailingJob.performLater()

    await backgroundJobs.run()

    await sleep(4000)

    await backgroundJobs.stop()
    await backgroundJobs.release()

    expect(retryMock.mock.calls).toEqual([
      [
        {
          event: 'retry',
          measurement: expect.any(Measurement),
          payload: {
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
            })
          }
        }
      ],
      [
        {
          event: 'retry',
          measurement: expect.any(Measurement),
          payload: {
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
            })
          }
        }
      ],
      [
        {
          event: 'retry',
          measurement: expect.any(Measurement),
          payload: {
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
            })
          }
        }
      ]
    ])
    expect(failedMock.mock.calls).toEqual([
      [
        {
          event: 'failed',
          measurement: expect.any(Measurement),
          payload: {
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
            })
          }
        }
      ]
    ])
  })
})
