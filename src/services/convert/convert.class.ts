import { ServiceInterface } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Currency } from '../../models/currency.model'
import { Conversion } from '../../models/conversion.model'
import { BadRequest } from '@feathersjs/errors'
import { addToQueue } from '../../helpers/rabbit-queue'

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

  /**
   * Converts an amount from one currency to another using stored exchange rates
   * @param data Object containing source currency (from), target currency (to) and amount to convert
   * @returns Object with the converted amount in the target currency
   * @throws BadRequest if one or both currencies are not found in the database
   */
  async create(data: ConvertData): Promise<ConvertResult> {
    const { from, to, amount } = data

    // Fetch both currency rates in parallel for better performance
    const [fromCurrency, toCurrency] = await Promise.all([
      Currency.findById(from),
      Currency.findById(to)
    ])

    // Validate that both currencies exist in our database
    if (!fromCurrency || !toCurrency) {
      throw new BadRequest('One or both currencies not found')
    }

    // Convert amount to USD (base currency) first, then to target currency
    // Formula: (amount / source_rate) * target_rate
    const result = (amount / fromCurrency.rate) * toCurrency.rate

    // Round to 2 decimal places to avoid floating point precision issues
    const roundedResult = Math.round(result * 100) / 100

    const conversionData = {
      from,
      to,
      amount,
      result: roundedResult,
      timestamp: new Date()
    }

    // Store conversion history in database for tracking
    await Conversion.create(conversionData)

    // Add conversion data to RabbitMQ queue for further processing
    addToQueue(conversionData)

    return { result: roundedResult }
  }
}

export const getOptions = (app: Application) => {
  return { app }
}
