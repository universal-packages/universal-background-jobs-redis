import { BaseJob } from '@universal-packages/background-jobs'

export default class ExcellentJob extends BaseJob {
  public static performJestFn = jest.fn()

  public async perform(payload: Record<string, any>): Promise<void> {
    ExcellentJob.performJestFn(payload)
  }
}
