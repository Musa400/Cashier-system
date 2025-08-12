// controllers/exchangeRateController.js
const ExchangeRate = require('../model/Rate');

// Get all exchange rates
// GET /api/exchange-rate/rates
exports.getRates = async (req, res) => {
  try {
    const rates = await ExchangeRate.find({}).sort({ fromCurrency: 1, toCurrency: 1 });
    res.json({ 
      success: true, 
      data: rates,
      count: rates.length 
    });
  } catch (err) {
    console.error('Error fetching rates:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch exchange rates',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Update or create exchange rate
// PUT /api/exchange-rate/rates
exports.updateRate = async (req, res) => {
  const { fromCurrency, toCurrency, rate, rateType } = req.body;
  
  // Validate required fields
  if (!fromCurrency || !toCurrency || rate === undefined || rate === null || !rateType) {
    return res.status(400).json({ 
      success: false, 
      message: 'fromCurrency, toCurrency, rate, and rateType are required' 
    });
  }

  // Validate rate type
  if (!['sell', 'buy'].includes(rateType)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid rateType. Must be either "sell" or "buy"' 
    });
  }

  // Validate rate is a positive number
  const rateValue = parseFloat(rate);
  if (isNaN(rateValue) || rateValue < 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Rate must be a positive number' 
    });
  }

  try {
    // Prepare update object
    const updateData = { 
      [rateType === 'sell' ? 'sellRate' : 'buyRate']: rateValue,
      lastUpdated: new Date()
    };

    // Find and update or create the rate
    const updatedRate = await ExchangeRate.findOneAndUpdate(
      { 
        fromCurrency: fromCurrency.toUpperCase(), 
        toCurrency: toCurrency.toUpperCase() 
      },
      updateData,
      { 
        new: true, 
        upsert: true,
        runValidators: true 
      }
    );

    res.json({ 
      success: true, 
      message: 'Exchange rate updated successfully',
      data: updatedRate 
    });
  } catch (err) {
    console.error('Error updating rate:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update exchange rate',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Get specific exchange rate
// GET /api/exchange-rate/rate/:fromCurrency/:toCurrency
exports.getRate = async (req, res) => {
  try {
    const { fromCurrency, toCurrency } = req.params;
    
    const rate = await ExchangeRate.findOne({
      fromCurrency: fromCurrency.toUpperCase(),
      toCurrency: toCurrency.toUpperCase()
    });

    if (!rate) {
      return res.status(404).json({
        success: false,
        message: 'Exchange rate not found'
      });
    }

    res.json({
      success: true,
      data: rate
    });
  } catch (err) {
    console.error('Error fetching rate:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exchange rate',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
