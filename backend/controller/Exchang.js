const Exchange = require('../model/Exchange');
const ExchangeRate = require('../model/Rate');
const Customer = require('../model/customer.model');
const { sendExchangeConfirmationEmail } = require('./email.controller');

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
      createdBy,
      customerEmail 
    } = req.body;

    // Validate required fields
    if (!customerId || !customerName || !fromCurrency || !toCurrency || !amount || !rate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    const amountNum = parseFloat(amount);
    const rateNum = parseFloat(rate);
    const convertedAmount = amountNum * rateNum;

    // Find the customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Customer not found' 
      });
    }

    // Create a copy of the customer for comparison
    const originalCustomer = JSON.parse(JSON.stringify(customer));

    // Find the source currency balance
    const sourceBalance = customer.balances.find(b => b.currency === fromCurrency);
    if (!sourceBalance || sourceBalance.balance < amountNum) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient balance in ${fromCurrency} account` 
      });
    }

    // Find or create target currency balance
    let targetBalance = customer.balances.find(b => b.currency === toCurrency);
    if (!targetBalance) {
      // If target currency doesn't exist, create it with 0 balance
      targetBalance = { currency: toCurrency, balance: 0 };
      customer.balances.push(targetBalance);
    }

    // Update balances
    sourceBalance.balance = parseFloat((sourceBalance.balance - amountNum).toFixed(2));
    targetBalance.balance = parseFloat((targetBalance.balance + convertedAmount).toFixed(2));

    // Create the exchange record
    const exchange = new Exchange({
      customerId,
      customerName,
      fromCurrency,
      toCurrency,
      amount: amountNum,
      rate: rateNum,
      convertedAmount: convertedAmount,
      createdBy: createdBy || 'System',
      date: new Date()
    });

    // Save the exchange record first
    await exchange.save();
    
    // Then save the customer with updated balances
    await customer.save();

    // Prepare the response data
    const responseData = { 
      success: true, 
      message: 'Currency exchange completed successfully',
      data: {
        exchange,
        newSourceBalance: sourceBalance.balance,
        newTargetBalance: targetBalance.balance
      }
    };

    // Send email confirmation if customer email is provided
    if (customerEmail) {
      // Create a fake response object to capture the email sending result
      const fakeRes = {
        status: function(code) { this.statusCode = code; return this; },
        json: function(data) {
          if (this.statusCode === 200) {
            console.log('Exchange confirmation email sent successfully');
          } else {
            console.error('Failed to send exchange confirmation email:', data);
          }
          // Send the original response
          res.status(200).json(responseData);
        }
      };

      // Call the email function with the fake response
      sendExchangeConfirmationEmail(
        { 
          body: { 
            toEmail: customerEmail,
            exchangeData: {
              accountNo: customer.accountNo,
              customerName: customerName,
              fromCurrency: fromCurrency,
              toCurrency: toCurrency,
              amount: amountNum,
              convertedAmount: convertedAmount,
              rate: rateNum,
              date: exchange.date
            }
          } 
        },
        fakeRes
      );
    } else {
      // If no email, just send the response
      res.status(200).json(responseData);
    }
  } catch (error) {
    console.error('Error in currency exchange:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process currency exchange',
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
