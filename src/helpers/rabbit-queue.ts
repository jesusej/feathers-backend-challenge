import { Rabbit } from "rabbit-queue"
import { logger } from "../logger"
import type { Application } from "@feathersjs/feathers"
import { IConversion } from "../models/conversion.model"

const QUEUE_NAME = '/queue'

let rabbit: Rabbit

export function setupQueue(app: Application) {
  rabbit = new Rabbit(app.get('rabbitmq_url'))

  rabbit.createQueue(QUEUE_NAME).then(() => {
    console.log(`Queue created: ${QUEUE_NAME}`)
  }).catch((err) => {
    console.error(`Error creating queue: ${err}`)
  })

  rabbit.on('disconnected', (err) => {
    console.log('RabbitMQ disconnected')
    if (err) {
      logger.error('RABBITMQ-ERR', err)
    }
  })
}

export function addToQueue(message: IConversion) {
  if (!rabbit) {
    console.error('RabbitMQ is not initialized')
    return
  }

  rabbit.publish(QUEUE_NAME, message).then(() => {
    console.log(`Message added to queue: ${JSON.stringify(message)}`)
  }).catch((err) => {
    console.error(`Error adding message to queue: ${err}`)
  })
}
