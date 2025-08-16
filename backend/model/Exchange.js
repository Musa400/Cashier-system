// models/Exchange.js
const mongoose = require('mongoose');

const ExchangeSchema = new mongoose.Schema({
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Customer',
    required: true 
  },
  accountNo : Number,
  customerName: { 
    type: String,
    required: true 
  },
  fromCurrency: { 
    type: String, 
    required: true 
  },
  toCurrency: { 
    type: String, 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  rate: { 
    type: Number, 
    required: true 
  },
  convertedAmount: {
    type: Number,
    required: true
  },
  createdBy: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
}, { timestamps: true });

module.exports = mongoose.model('Exchange', ExchangeSchema);
