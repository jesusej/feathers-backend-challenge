import oxr, { LatestRates } from 'open-exchange-rates';
import { Application } from '@feathersjs/feathers';
import { logger } from '../logger';

export interface CurrencyHelperOptions {
  appId: string;
}

/**
 * Fetches the latest exchange rates from the OpenExchangeRates API
 * @returns A record of currency codes and their rates
 */
export const getLatestRates = async (): Promise<Record<string, number>> => {
  try {
    const latest = await new Promise<LatestRates>((resolve, reject) => {
      oxr.latest((error) => {
        if (error) {
          reject(error);
        } else {
          resolve(oxr);
        }
      });
    });
    return latest.rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    throw error;
  }
};

/**
 * Configures the OpenExchangeRates client with the application's API key
 * @param app The Feathers application instance
 */
export const configureCurrencyHelper = (app: Application) => {
  const appId = app.get('currency_app_id') as string;
  oxr.set({ app_id: appId });
};
