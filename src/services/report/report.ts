// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import type { Application } from '../../declarations'
import { addPdfHeaders } from '../../hooks/add-pdf-headers'
import { ReportService, getOptions } from './report.class'

export const reportPath = 'report'
export const reportMethods: Array<keyof ReportService> = ['find']

export * from './report.class'

// A configure function that registers the service and its hooks via `app.configure`
export const report = (app: Application) => {
  // Register our service on the Feathers application
  app.use(reportPath, new ReportService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: reportMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(reportPath).hooks({
    around: {
      all: []
    },
    before: {
      all: [],
      find: [addPdfHeaders],
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
    [reportPath]: ReportService
  }
}
