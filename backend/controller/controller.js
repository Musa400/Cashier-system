const mongoose = require('mongoose');
const dbService = require('../services/db.service');
const userSchema = require('../model/users.model');
const Customer = require("../model/customer.model");
const CashSummary = require("../model/CashierSummary");
const Transactions = require("../model/transactionmodel");
const { sendTransactionConfirmationEmail } = require('./email.controller');

const getData = async (req, res, schema) => {
    try {
        const dbRes = await dbService.findAllRecord(schema);
        return res.status(200).json({ message: "Record is Found!", data: dbRes, success: true });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", success: false, error });
    }
}

const createData = async (req, res, schema) => {
    try {
        const data = req.body;
        console.log("Creating data for model:", schema.modelName);
        console.log("Request data:", JSON.stringify(data, null, 2));

        // Handle transaction creation
        if (schema.modelName === 'transaction') {
            console.log("Processing transaction...");
            
            // For bank accounts, we need to update the store money
            const customer = await Customer.findById(data.customerId);
            console.log("Customer found:", customer ? customer.accountType : 'Not found');
            
            if (customer && customer.accountType === 'bank') {
                console.log("Processing bank account transaction");
                
                // Get current store balance for the currency
                const currency = data.currency.toUpperCase();
                
                let storeRecord = await CashSummary.findOne({
                    currency: currency,
                    location: 'store'
                });
                
                console.log("Current store record:", storeRecord);
                
                let newAmount;
                
                if (storeRecord) {
                    // Update existing record
                    newAmount = data.transactionType === 'cr' 
                        ? storeRecord.amount - Math.abs(parseFloat(data.transactionAmount))
                        : storeRecord.amount + Math.abs(parseFloat(data.transactionAmount));
                        
                    storeRecord.amount = newAmount;
                    await storeRecord.save();
                    console.log("Updated existing store record");
                } else {
                    // Create new record
                    newAmount = data.transactionType === 'cr' 
                        ? -Math.abs(parseFloat(data.transactionAmount))
                        : Math.abs(parseFloat(data.transactionAmount));
                        
                    storeRecord = await new CashSummary({
                        currency: currency,
                        location: 'store',
                        amount: newAmount
                    }).save();
                    console.log("Created new store record");
                }
                
                console.log("Final store record:", storeRecord);
                
                // Create the transaction first
                const newTransaction = new schema(data);
                const savedTransaction = await newTransaction.save();
                
                // If customer exists and has email, send confirmation
                if (customer && customer.email) {
                    const emailData = {
                        toEmail: customer.email.trim(),
                        transactionData: {
                            customerName: customer.fullname || `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
                            accountNo: customer.accountNo,
                            transactionType: data.transactionType,
                            transactionAmount: data.transactionAmount,
                            currency: data.currency || 'USD',
                            refrence: data.refrence || 'N/A',
                            currentBalance: data.currentBalance || 'N/A',
                            createdAt: savedTransaction.createdAt
                        }
                    };
                    
                    // Send email in background (don't wait for response)
                    sendTransactionConfirmationEmail(
                        { body: emailData },
                        { 
                            status: () => ({ json: () => {} }),
                            json: () => {}
                        }
                    );
                }
                
                return res.status(200).json({
                    message: "Transaction created and store money updated successfully",
                    data: {
                        transaction: savedTransaction,
                        storeBalance: storeRecord.amount
                    },
                    success: true
                });
            }
        }

        // Handle user email uniqueness check
        if (schema.modelName === 'user') {
            const existingUser = await schema.findOne({ email: data.email });
            if (existingUser) {
                return res.status(409).json({
                    message: "Email already exists",
                    success: false
                });
            }
        }

        // Default create operation for non-bank transactions
        const newRecord = new schema(data);
        const savedRecord = await newRecord.save();
        
        // If customer exists and has email, send confirmation
        if (schema.modelName === 'transaction') {
            const customer = await Customer.findById(data.customerId);
            if (customer && customer.email) {
                const emailData = {
                    toEmail: customer.email.trim(),
                    transactionData: {
                        customerName: customer.fullname || `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
                        accountNo: customer.accountNo,
                        transactionType: data.transactionType,
                        transactionAmount: data.transactionAmount,
                        currency: data.currency || 'USD',
                        refrence: data.refrence || 'N/A',
                        currentBalance: data.currentBalance || 'N/A',
                        createdAt: savedRecord.createdAt
                    }
                };
                
                // Send email in background (don't wait for response)
                sendTransactionConfirmationEmail(
                    { body: emailData },
                    { 
                        status: () => ({ json: () => {} }),
                        json: () => {}
                    }
                );
            }
        }
        
        res.status(200).json({
            message: "Data inserted successfully",
            data: savedRecord,
            success: true
        });
        
    } catch (error) {
        console.error("Error in createData:", error);
        
        // Handle specific error types
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: "Validation Error",
                success: false,
                error: error.message,
                errors: error.errors
            });
        }
        
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Duplicate key error",
                success: false,
                error: error.message
            });
        }
        
        res.status(500).json({
            message: "Internal server error",
            success: false,
            error: error.message
        });
    }
}

const updateData = async (req, res, schema) => {
    try {
        const { id } = req.params;
        const data = req.body
        const dbRes = await dbService.updateRecord(id, data, schema)
        return res.status(200).json({
            message: "Record Is Updated !",
            data: dbRes
        })

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error !"
        })
    }

}
const deleteData = async (req, res, schema) => {
    try {
        const { id } = req.params;

        const dbRes = await dbService.deleteRecord(id, schema)
        return res.status(200).json({
            message: "User Is Delete Successfully !",
            data: dbRes
        })

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error !"
        })
    }

}
// find by account No
const findByAccountNo = async (req, res, schema) => {
    try {
        const query = req.body;
        const dbRes = await dbService.findOneRecord(query, schema)
        res.status(200).json({
            message: "Record Found  !",
            data: dbRes
        })
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error !"
        })
    }
}


const getCurrencySummary = async (req, res) => {
    try {
        const personData = await Customer.aggregate([
            { $match: { accountType: "person" } },
            { $unwind: "$balances" },
            {
                $group: {
                    _id: "$balances.currency",
                    total: { $sum: "$balances.balance" }
                }
            }
        ]);

        const personSummary = {};
        personData.forEach(item => {
            personSummary[item._id] = item.total;
        });


        const cashData = await CashSummary.aggregate([
            {
                $group: {
                    _id: "$currency",
                    total: { $sum: "$amount" }
                }
            }
        ]);

        const cashSummary = {};
        cashData.forEach(item => {
            cashSummary[item._id] = item.total;
        });

        // 🔁 Step 3: Combine both into final result
        const allCurrencies = new Set([
            ...Object.keys(personSummary),
            ...Object.keys(cashSummary),
        ]);

        const result = Array.from(allCurrencies).map(currency => ({
            currency,
            CustomerMoney: personSummary[currency] || 0,
            OwnerMoney: cashSummary[currency] || 0,
            TotalStoreMoney: (personSummary[currency] || 0) + (cashSummary[currency] || 0)
        }));

        res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching currency summary:", error);
        res.status(500).json({ message: "Server Error", error });
    }
};

const getBankCurrencyTotals = async (req, res) => {
    try {
        const result = await Customer.aggregate([
            { $match: { accountType: "bank" } },
            { $unwind: "$balances" },
            {
                $project: {
                    fullname: 1,
                    currency: "$balances.currency",
                    balance: "$balances.balance"
                }
            }
        ]);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error in getBankCurrencyTotals:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


const getTransactionSummary = async (req, res, schema) => {
    const { branch,accountNo } = req.query;
    let matchStage = {};
    if(branch) matchStage.branch = branch;
    if(accountNo) matchStage.accountNo = Number(accountNo);
    console.log(matchStage)
    try {
        const summary = await schema.aggregate([
            {
                $match :  matchStage 
            },
            {
                $group : {
                    _id : null,
                    totalCredit : {
                        $sum : {
                            $cond : [{$eq:["$transactionType","cr"]},"$transactionAmount",0]
                        }
                    },
                    totalDebit : {
                        $sum : {
                            $cond : [{$eq:["$transactionType","dr"]},"$transactionAmount",0]
                        }
                    },
                    creditCount : {
                        $sum : {
                            $cond : [{$eq:["$transactionType","cr"]},1,0]
                        }
                    },
                    debitCount : {
                        $sum : {
                            $cond : [{$eq:["$transactionType","dr"]},1,0]
                        }
                    },
                    totalTransactions : {
                        $sum : 1
                    }
                    
                }
            },
            {
                $project : {
                    _id : 0,
                    totalCredit : 1,
                    totalDebit : 1,
                    totalTransactions : 1,
                    debitCount :1,
                    creditCount : 1,
                    balance : {$subtract: ["$totalCredit","$totalDebit"]}
                }

            }
        ]);
        if (summary.length === 0) {
            return res.status(404).json({
                message: 'No matching transaction found'
            });


        }
        res.status(200).json(summary[0])

    } catch (error) {
        res.status(500).json({
            message: 'Error calculating summary', error
        })
    }

}

const getPaginatedTransactions = async (req, res, schema) => {
    try {
        const { accountNo, branch, page = 1, pageSize = 10 } = req.query;

        const filter = {};
        if (accountNo) filter.accountNo = accountNo;
        if (branch) filter.branch = branch;

        const skip = (parseInt(page) - 1) * parseInt(pageSize);
        const limit = parseInt(pageSize);

        const [transactions, total] = await Promise.all([
            schema.find(filter)
                .sort({ createdAt: -1 }) // Optional: newest first
                .skip(skip)
                .limit(limit),
            schema.countDocuments(filter)
        ]);

        res.status(200).json({
            data: transactions,
            total,
            page: parseInt(page),
            pageSize: parseInt(pageSize)
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching transactions", error });
    }
};

const getDashboardStats = async (req, res, transactionSchema, customerSchema) => {
    try {
        // Get transaction summary
        const [transactionSummary, customerCount] = await Promise.all([
            // Get transaction stats
            transactionSchema.aggregate([
                {
                    $group: {
                        _id: null,
                        totalCredit: {
                            $sum: {
                                $cond: [{ $eq: ["$transactionType", "cr"] }, "$transactionAmount", 0]
                            }
                        },
                        totalDebit: {
                            $sum: {
                                $cond: [{ $eq: ["$transactionType", "dr"] }, "$transactionAmount", 0]
                            }
                        },
                        totalTransactions: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalCredit: 1,
                        totalDebit: 1,
                        totalTransactions: 1,
                        totalAmount: { $subtract: ["$totalCredit", "$totalDebit"] }
                    }
                }
            ]).exec(),

            // Get total customer count
            customerSchema.countDocuments({})
        ]);

        // Extract results
        const stats = transactionSummary[0] || {
            totalCredit: 0,
            totalDebit: 0,
            totalTransactions: 0,
            totalAmount: 0
        };

        res.status(200).json({
            success: true,
            data: {
                totalTransactions: stats.totalTransactions,
                totalAmount: stats.totalAmount,
                totalCredit: stats.totalCredit,
                totalDebit: stats.totalDebit,
                totalCustomers: customerCount
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics',
            error: error.message
        });
    }
};

const getStoreAccount = async (req, res, schema) => {
    try {
        const storeAccount = await dbService.findOneRecord({ accountType: 'store' }, schema);
        if (!storeAccount) {
            return res.status(404).json({ message: "Store account not found!", success: false });
        }
        return res.status(200).json({ message: "Store account found!", data: storeAccount, success: true });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", success: false, error });
    }
};

const getTransactionByCustomer = async  (req, res, schema) => {
    const {customerId} = req.params;
    try{
        const transactions = await schema.find({ customerId}).sort({createdAt: -1});
        res.status(200).json({
            message: "Customer Transaction history fetched!",
            data: transactions,
            success: true

        })  
     } catch (error){
        res.status(500).json({
            message: "Internal server error",
            success: false,
            error
        });
     }
}
const getExchangeByCustomer = async  (req, res, schema) => {
    const {customerId} = req.params;
    try{
        const exchange = await schema.find({ customerId}).sort({createdAt: -1});
        res.status(200).json({
            message: "Customer Exchange history fetched!",
            data: exchange,
            success: true

        })  
     } catch (error){
        res.status(500).json({
            message: "Internal server error",
            success: false,
            error
        });
     }
}

module.exports = {
    getData,
    createData,
    updateData,
    deleteData,
    findByAccountNo,
    getPaginatedTransactions,
    getDashboardStats,
    getStoreAccount,
    getCurrencySummary,
    getBankCurrencyTotals,
    getTransactionByCustomer,
    getTransactionSummary,
    getExchangeByCustomer
};