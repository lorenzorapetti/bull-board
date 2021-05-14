import { Request, RequestHandler, Response } from 'express-serve-static-core'
import { BaseAdapter } from '../../queueAdapters/base'

export const pause: RequestHandler = async (_req: Request, res: Response) => {
  const { queue } = res.locals as { queue: BaseAdapter }
  await queue.pause()
  return res.sendStatus(200)
}
