import Coingecko from '@coingecko/coingecko-typescript'
import { Application } from '@feathersjs/feathers'

export const getLatestCryptoRates = async (app: Application): Promise<Record<string, number>> => {
  const coingecko = new Coingecko({
    demoAPIKey: app.get('crypto_app_id') as string,
    environment: 'demo'
  })

  try {
    const response = await coingecko.coins.markets.get({ vs_currency: 'usd' })

    let cryptoRates: Record<string, number> = {}

    response.forEach(item => {
      cryptoRates[item.symbol?.toUpperCase() as string] = item.current_price as number
    })

    return cryptoRates
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const getLatestCurrencyRates = async (app: Application): Promise<Record<string, number>> => {
  const appId = app.get('currency_app_id') as string
  return fetch(`https://openexchangerates.org/api/latest.json?app_id=${appId}`, {
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

/**
 * Fetches the latest exchange rates from OpenExchangeRates and CoinGecko
 * @returns A record of currency codes and their rates
 */
export const getLatestRates = async (app: Application) => {
  const [currencyRates, cryptoRates] = await Promise.all([
    getLatestCurrencyRates(app),
    getLatestCryptoRates(app)
  ])

  return {
    ...currencyRates,
    ...cryptoRates
  }
}
