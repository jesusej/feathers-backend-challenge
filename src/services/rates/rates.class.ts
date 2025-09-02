// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import type { Params, ServiceInterface } from '@feathersjs/feathers'

import type { Application } from '../../declarations'
import { getLatestRates } from '../../helpers/currency'

type Rates = any
type RatesData = any
type RatesPatch = any
type RatesQuery = any

export type { Rates, RatesData, RatesPatch, RatesQuery }

export interface RatesServiceOptions {
  app: Application
}

export interface RatesParams extends Params<RatesQuery> {}

// This is a skeleton for a custom service class. Remove or add the methods you need here
export class RatesService<ServiceParams extends RatesParams = RatesParams>
  implements ServiceInterface<Rates, RatesData, ServiceParams, RatesPatch>
{
  constructor(public options: RatesServiceOptions) {}

  async find(_params?: ServiceParams): Promise<Rates[]> {
    const rates = await getLatestRates();
    console.log('RATES', rates)
    return Object.entries(rates).map(([currency, rate]) => ({
      currency,
      rate
    }));
  }

  async create(data: RatesData, params?: ServiceParams): Promise<Rates>
  async create(data: RatesData[], params?: ServiceParams): Promise<Rates[]>
  async create(data: RatesData | RatesData[], params?: ServiceParams): Promise<Rates | Rates[]> {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current, params)))
    }

    return {
      id: 0,
      ...data
    }
  }
}
