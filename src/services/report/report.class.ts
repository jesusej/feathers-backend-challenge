// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import type { Id, NullableId, Params, ServiceInterface } from '@feathersjs/feathers'

import type { Application } from '../../declarations'

type Report = any
type ReportData = any
type ReportPatch = any
type ReportQuery = any

export type { Report, ReportData, ReportPatch, ReportQuery }

export interface ReportServiceOptions {
  app: Application
}

export interface ReportParams extends Params<ReportQuery> {}

// This is a skeleton for a custom service class. Remove or add the methods you need here
export class ReportService<ServiceParams extends ReportParams = ReportParams>
  implements ServiceInterface<Report, ReportData, ServiceParams, ReportPatch>
{
  constructor(public options: ReportServiceOptions) {}

  async find(_params?: ServiceParams): Promise<Report[]> {
    return []
  }

  async get(id: Id, _params?: ServiceParams): Promise<Report> {
    return {
      id: 0,
      text: `A new message with ID: ${id}!`
    }
  }

  async create(data: ReportData, params?: ServiceParams): Promise<Report>
  async create(data: ReportData[], params?: ServiceParams): Promise<Report[]>
  async create(data: ReportData | ReportData[], params?: ServiceParams): Promise<Report | Report[]> {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current, params)))
    }

    return {
      id: 0,
      ...data
    }
  }

  // This method has to be added to the 'methods' option to make it available to clients
  async update(id: NullableId, data: ReportData, _params?: ServiceParams): Promise<Report> {
    return {
      id: 0,
      ...data
    }
  }

  async patch(id: NullableId, data: ReportPatch, _params?: ServiceParams): Promise<Report> {
    return {
      id: 0,
      text: `Fallback for ${id}`,
      ...data
    }
  }

  async remove(id: NullableId, _params?: ServiceParams): Promise<Report> {
    return {
      id: 0,
      text: 'removed'
    }
  }
}

export const getOptions = (app: Application) => {
  return { app }
}
