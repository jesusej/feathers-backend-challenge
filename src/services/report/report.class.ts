import type { Params, ServiceInterface } from '@feathersjs/feathers'

import type { Application } from '../../declarations'
import { Readable } from 'stream'
import Conversion from '../../models/conversion.model'
import { generateConversionReport } from '../../helpers/pdf'

type Report = Readable

export interface ReportServiceOptions {
  app: Application
}

export class ReportService
  implements ServiceInterface<Report, null, Params>
{
  constructor(public options: ReportServiceOptions) {}

  async find(params?: Params): Promise<Readable> {
    // Get today conversions
    const conversions = await Conversion.find({ timestamp: {$gt: new Date().setHours(0, 0, 0, 0), $lt: new Date().setHours(23, 59, 59, 999)} }).lean().exec()

    const report = generateConversionReport(conversions)

    return report
  }
}

export const getOptions = (app: Application) => {
  return { app }
}
