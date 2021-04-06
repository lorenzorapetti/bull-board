import { Job, Queue } from 'bull'
import {
  JobCleanStatus,
  JobCounts,
  JobStatus,
  QueueAdapterOptions,
} from '../@types/app'
import { BaseAdapter } from './base'

export class BullAdapter extends BaseAdapter {
  constructor(public queue: Queue, options: Partial<QueueAdapterOptions> = {}) {
    super(options)
  }

  public getClient(): Promise<Queue['client']> {
    return Promise.resolve(this.queue.client)
  }

  public getName(): string {
    return this.queue.name
  }

  public clean(jobStatus: JobCleanStatus, graceTimeMs: number): Promise<any> {
    return this.queue.clean(graceTimeMs, jobStatus as any)
  }

  public getJob(id: string): Promise<Job | undefined | null> {
    return this.queue.getJob(id)
  }

  public getJobs(
    jobStatuses: JobStatus[],
    start?: number,
    end?: number,
  ): Promise<Job[]> {
    return this.queue.getJobs(jobStatuses as any, start, end)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getJobCounts(..._jobStatuses: JobStatus[]): Promise<JobCounts> {
    return (this.queue.getJobCounts() as unknown) as Promise<JobCounts>
  }

  public pause(): Promise<void> {
    return this.queue.pause()
  }

  public resume(): Promise<void> {
    return this.queue.resume()
  }

  public isPaused(): Promise<boolean> {
    return this.queue.isPaused()
  }

  public getJobLogs(id: string): Promise<string[]> {
    return this.queue.getJobLogs(id).then(({ logs }) => logs)
  }
}
