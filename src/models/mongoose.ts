import mongoose from 'mongoose';
import { Application } from '../declarations';
import { logger } from '../logger';

export default function (app: Application) {
  mongoose.connect(app.get('mongodb'))
    .then(() => {
      logger.info('MongoDB connected');
    })
    .catch(err => {
      logger.error('MongoDB connection error:', err);
    });

  return mongoose;
}