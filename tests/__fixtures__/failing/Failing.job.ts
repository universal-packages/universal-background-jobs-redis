import { BaseJob } from '@universal-packages/background-jobs'

export default class FailingJob extends BaseJob {
  public static retryAfter = '1 second'
  public static maxRetries = 3
}
