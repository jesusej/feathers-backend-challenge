import { Application } from '@feathersjs/feathers'

/**
 * Fetches the latest exchange rates from the Exchange Rates API
 * @returns A record of currency codes and their rates
 */
export const getLatestRates = async (app: Application): Promise<Record<string, number>> => {
  const appId = app.get('currency_app_id') as string
  return fetch(`https://openexchangerates.org/api/latest.json?app_id=${appId}&show_alternative=true`, {
    method: 'GET'
  })
    .then(async response => {
      const data = await response.json()

      return data.rates as Record<string, number>
    })
    .catch(error => {
      console.error(error)
      throw error
    })
}
