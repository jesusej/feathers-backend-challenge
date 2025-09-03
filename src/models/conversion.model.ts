import mongoose from 'mongoose';

export interface IConversion {
  from: string;
  to: string;
  amount: number;
  result: number;
  timestamp: Date;
}

const conversionSchema = new mongoose.Schema<IConversion>({
  from: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    match: /^[A-Z]{3}$/  // Ensures 3-letter currency codes
  },
  to: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    match: /^[A-Z]{3}$/  // Ensures 3-letter currency codes
  },
  amount: {
    type: Number,
    required: true,
    min: 0  // Amount cannot be negative
  },
  result: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false
});

// Create indexes for better query performance
conversionSchema.index({ timestamp: -1 });
conversionSchema.index({ from: 1, to: 1 });

export const Conversion = mongoose.model<IConversion>('Conversion', conversionSchema);
export default Conversion;
