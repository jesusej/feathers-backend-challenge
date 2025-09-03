import type { Params, ServiceInterface } from '@feathersjs/feathers';
import type { Application } from '../../declarations';
import Currency, { ICurrency } from '../../models/currency.model';
import { getLatestRates } from '../../helpers/currency';
import { logger } from '../../logger';
import { BadRequest, NotFound } from '@feathersjs/errors';

type Rates = ICurrency;
type RatesData = Omit<ICurrency, 'createdAt' | 'updatedAt'>;
type RatesPatch = Partial<RatesData>;
type RatesQuery = Partial<RatesData>;

export type { Rates, RatesData, RatesPatch, RatesQuery };

export interface RatesServiceOptions {
  app: Application;
}

export interface RatesParams extends Params<RatesQuery> {}

export class RatesService<ServiceParams extends RatesParams = RatesParams>
  implements ServiceInterface<Rates, RatesData, ServiceParams, RatesPatch>
{
  constructor(public options: RatesServiceOptions) {
    this.syncRatesWithDB().catch(error => {
      logger.error('Failed to sync initial rates with database:', error);
    });
  }

  /**
   * Synchronizes the latest exchange rates with the database.
   * This method:
   * 1. Fetches the latest rates from the external API
   * 2. Transforms the data to match our database schema (_id: currency code, rate: exchange rate)
   * 3. Uses bulk upsert operations to efficiently update/insert rates
   * 4. Handles existing data by updating if the currency exists or inserting if it doesn't
   * 
   * @throws Will throw and log an error if the sync operation fails
   */
  private async syncRatesWithDB(): Promise<void> {
    try {
      const rates = await getLatestRates();
      
      const bulkOps = Object.entries(rates).map(([currency, rate]) => ({
        updateOne: {
          filter: { _id: currency },
          update: { $set: { rate } },
          upsert: true
        }
      }));

      const result = await Currency.bulkWrite(bulkOps);
      logger.info(`Successfully synced rates with database. Modified: ${result.modifiedCount}, Upserted: ${result.upsertedCount}`);
    } catch (error) {
      logger.error('Error syncing rates with database:', error);
      throw error;
    }
  }

  /**
   * Retrieves all currency exchange rates from the database.
   * Returns a list of currencies with their respective rates,
   * excluding the createdAt timestamp for cleaner response data.
   * 
   * @returns Promise<Rates[]> Array of currency objects containing _id (currency code) and rate
   */
  async find(): Promise<Rates[]> {
    return Currency.find({}, { createdAt: 0 }).exec();
  }

  async create(data: RatesData): Promise<Rates> {
    const existingCurrency = await Currency.findById(data._id);
    if (!existingCurrency) {
      logger.error(`Currency ${data._id} not found`);
      throw new NotFound(`Currency ${data._id} does not exist in the database`);
    }

    try {
      const updatedCurrency = await Currency.findOneAndUpdate(
        { _id: data._id },
        { rate: data.rate },
        { new: true, fields: { createdAt: 0, updatedAt: 0 } }
      );

      if (!updatedCurrency) {
        throw new Error('Failed to update currency rate');
      }

      logger.info(`Successfully updated rate for currency ${data._id}`);
      return updatedCurrency;
    } catch (error) {
      logger.error('Error updating currency rate:', error);
      throw new BadRequest('Failed to update currency rate');
    }
  }
}
