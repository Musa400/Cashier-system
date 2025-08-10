const Exchange = require('../model/Exchange');
const ExchangeRate = require('../model/Rate');

// Create new exchange
exports.createExchange = async (req, res) => {
  try {
    const { 
      customerId, 
      customerName, 
      fromCurrency, 
      toCurrency, 
      amount, 
      rate, 
      createdBy 
    } = req.body;

    // Validate required fields
    if (!customerId || !customerName || !fromCurrency || !toCurrency || !amount || !rate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Create the exchange record
    const exchange = new Exchange({
      customerId,
      customerName,
      fromCurrency,
      toCurrency,
      amount: parseFloat(amount),
      rate: parseFloat(rate),
      createdBy: createdBy || 'System',
      date: new Date()
    });

    await exchange.save();

    res.json({ 
      success: true, 
      message: 'Exchange created successfully',
      data: exchange 
    });
  } catch (error) {
    console.error('Error creating exchange:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// د تبادلې تاریخچه ترلاسه کول
exports.getExchangeHistory = async (req, res) => {
  try {
    const history = await Exchange.find({}).sort({ date: -1 });
    res.json({ 
      success: true, 
      data: history 
    });
  } catch (error) {
    console.error('Error fetching exchange history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// د نرخونو لیست ترلاسه کول
exports.getExchangeRates = async (req, res) => {
  try {
    const rates = await ExchangeRate.find({});
    res.json({ 
      success: true, 
      data: rates 
    });
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};
