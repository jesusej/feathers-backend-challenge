import mongoose from 'mongoose';

export interface ICurrency {
  _id: string;  // Currency code (e.g., "USD")
  rate: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const currencySchema = new mongoose.Schema<ICurrency>({
  _id: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    match: /^[A-Z]{3}$/  // Ensures 3-letter currency codes
  },
  rate: {
    type: Number,
    required: true,
    min: 0  // Rates cannot be negative
  }
}, {
  timestamps: true,
  versionKey: false
});

// Create indexes for better query performance
currencySchema.index({ updatedAt: -1 });

export const Currency = mongoose.model<ICurrency>('Currency', currencySchema);
export default Currency;
