// controllers/exchangeRateController.js
const ExchangeRate = require('../model/Rate');

// د ټولو نرخونو لیست
exports.getRates = async (req, res) => {
  try {
    const rates = await ExchangeRate.find({});
    res.json({ success: true, data: rates });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// د نرخ اضافه یا اپډېټ
exports.updateRate = async (req, res) => {
  const { fromCurrency, toCurrency, rate } = req.body;
  if (!fromCurrency || !toCurrency || !rate) {
    return res.status(400).json({ success: false, message: 'All fields required' });
  }

  try {
    // که نرخ موجود وي اپډېټ کوي، که نه نوي جوړوي
    const updated = await ExchangeRate.findOneAndUpdate(
      { fromCurrency, toCurrency },
      { rate },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
