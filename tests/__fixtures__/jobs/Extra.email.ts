import { BaseJob } from '@universal-packages/background-jobs'

export default class ExtraEmail extends BaseJob {
  public static queue: string = 'email'
  public static performJestFn = jest.fn()

  public async perform(payload: Record<string, any>): Promise<void> {
    ExtraEmail.performJestFn(payload)
  }
}
