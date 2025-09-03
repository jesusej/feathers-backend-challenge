import { convert } from './convert/convert'
import { rates } from './rates/rates'
// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html#configure-functions
import type { Application } from '../declarations'

export const services = (app: Application) => {
  app.configure(convert)
  app.configure(rates)
  // All services will be registered here
}
