// models/ExchangeRate.js
const mongoose = require('mongoose');

const ExchangeRateSchema = new mongoose.Schema({
  fromCurrency: { 
    type: String, 
    required: true,
    uppercase: true
  },
  toCurrency: { 
    type: String, 
    required: true,
    uppercase: true 
  },
  sellRate: { 
    type: Number, 
    required: true,
    min: 0
  },
  buyRate: { 
    type: Number, 
    required: true,
    min: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create a compound index to ensure unique currency pairs
ExchangeRateSchema.index(
  { fromCurrency: 1, toCurrency: 1 }, 
  { unique: true }
);

// Virtual for the reverse rate
ExchangeRateSchema.virtual('reverseRate', {
  ref: 'ExchangeRate',
  localField: 'toCurrency',
  foreignField: 'fromCurrency',
  justOne: true
});

module.exports = mongoose.model('ExchangeRate', ExchangeRateSchema);
