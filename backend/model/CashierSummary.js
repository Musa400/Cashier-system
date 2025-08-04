const mongoose = require("mongoose");

const cashSummarySchema = new mongoose.Schema({
  currency: { type: String, required: true },  // USD, AFN, EUR
  amount: { type: Number, required: true },
  location: { type: String, enum: ["store", "bank"], required: true },
  bankName: { type: String },  // فقط که location = "bank"
}, { timestamps: true });

module.exports = mongoose.model("CashSummary", cashSummarySchema);
