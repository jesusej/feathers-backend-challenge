// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import type { Application } from '../../declarations'
import { RatesService } from './rates.class'

export const ratesPath = 'rates'
export const ratesMethods: Array<keyof RatesService> = ['find', 'create']

export * from './rates.class'

// A configure function that registers the service and its hooks via `app.configure`
export const rates = (app: Application) => {
  // Register our service on the Feathers application
  app.use(ratesPath, new RatesService({ app }), {
    // A list of all methods this service exposes externally
    methods: ratesMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(ratesPath).hooks({
    around: {
      all: []
    },
    before: {
      all: [],
      find: [],
      create: [],
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [ratesPath]: RatesService
  }
}
