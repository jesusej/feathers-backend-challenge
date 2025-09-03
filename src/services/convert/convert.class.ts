import { ServiceInterface } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Currency } from '../../models/currency.model'
import { Conversion } from '../../models/conversion.model'
import { BadRequest } from '@feathersjs/errors'

interface ConversionData {
  from: string
  to: string
  amount: number
}

export type ConvertData = ConversionData
export type ConvertResult = { result: number }

export interface ConvertOptions {
  app: Application
}

export class ConvertService implements ServiceInterface<ConvertResult, ConvertData>
{
  constructor(public options: ConvertOptions) {}

  async create(data: ConvertData): Promise<ConvertResult> {
    const { from, to, amount } = data

    // Get both rates from the database
    const [fromCurrency, toCurrency] = await Promise.all([
      Currency.findById(from),
      Currency.findById(to)
    ])

    // Check if both currencies exist
    if (!fromCurrency || !toCurrency) {
      throw new BadRequest('One or both currencies not found')
    }

    // Calculate the conversion
    const result = (amount / fromCurrency.rate) * toCurrency.rate

    // Round to 2 decimal places
    const roundedResult = Math.round(result * 100) / 100

    // Store the conversion
    await Conversion.create({
      from,
      to,
      amount,
      result: roundedResult,
      timestamp: new Date()
    })

    return { result: roundedResult }
  }
}

export const getOptions = (app: Application) => {
  return { app }
}
