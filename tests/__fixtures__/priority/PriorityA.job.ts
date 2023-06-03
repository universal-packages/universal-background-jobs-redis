import { BaseJob } from '@universal-packages/background-jobs'

export default class PriorityAJob extends BaseJob {
  public static performJestFn = jest.fn()

  public static queue = 'low'

  public async perform(payload: Record<string, any>): Promise<void> {
    PriorityAJob.performJestFn(payload)
  }
}
