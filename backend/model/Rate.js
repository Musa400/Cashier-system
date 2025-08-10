// models/ExchangeRate.js
const mongoose = require('mongoose');

const ExchangeRateSchema = new mongoose.Schema({
  fromCurrency: { type: String, required: true },
  toCurrency: { type: String, required: true },
  rate: { type: Number, required: true },
}, { timestamps: true });

ExchangeRateSchema.index({ fromCurrency: 1, toCurrency: 1 }, { unique: true });

module.exports = mongoose.model('ExchangeRate', ExchangeRateSchema);
