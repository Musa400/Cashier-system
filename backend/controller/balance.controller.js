const Customer = require('../model/customer.model');
const { mongo } = require('mongoose');

// Get balance summary for a specific currency
exports.getBalanceByCurrency = async (req, res) => {
    try {
        const { currency } = req.query;
        
        if (!currency) {
            return res.status(400).json({
                success: false,
                message: 'Currency parameter is required'
            });
        }

        // Find all customers with the specified currency
        const customers = await Customer.find({
            'balances.currency': currency
        });

        // Calculate balances
        let totalBalance = 0;
        let peopleOweMe = 0;    // Negative balances (we owe customers)
        let iOwePeople = 0;     // Positive balances (customers owe us)

        customers.forEach(customer => {
            const balanceObj = customer.balances.find(b => b.currency === currency);
            if (balanceObj) {
                const balance = balanceObj.balance;
                totalBalance += balance;
                
                if (balance < 0) {
                    peopleOweMe += balance;  // This will be negative
                } else if (balance > 0) {
                    iOwePeople += balance;   // This will be positive
                }
            }
        });

        res.status(200).json({
            success: true,
            currency,
            total: totalBalance,
            peopleOweMe,  // Negative value
            iOwePeople    // Positive value
        });

    } catch (error) {
        console.error('Error fetching balance:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching balance',
            error: error.message
        });
    }
};
