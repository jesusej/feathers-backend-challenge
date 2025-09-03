import type { Params, ServiceInterface } from '@feathersjs/feathers'

import type { Application } from '../../declarations'
import { Readable } from 'stream'

type Report = Readable

export interface ReportServiceOptions {
  app: Application
}

export class ReportService
  implements ServiceInterface<Report, null, Params>
{
  constructor(public options: ReportServiceOptions) {}

  async find(params?: Params): Promise<Readable> {
    
    return Readable.from([])
  }
}

export const getOptions = (app: Application) => {
  return { app }
}
