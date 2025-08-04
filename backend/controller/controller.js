const dbService = require('../services/db.service');
const userSchema = require('../model/users.model');

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

        // Explicit email uniqueness check for user schema
        if (schema.modelName === 'user') {
            const existingUser = await schema.findOne({ email: data.email });
            if (existingUser) {
                return res.status(409).json({
                    message: "Email already exists",
                    success: false
                });
            }
        }

        const dbRes = await dbService.createNewRecord(data, schema);
        res.status(200).json({
            message: "Data inserted successfully",
            data: dbRes,
            success: true
        });
    } catch (error) {
        console.error(error);
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Duplicate key error",
                success: false
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

const getPaginatedTransactions = async (req,res,schema) => {
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
                                $cond: [{$eq: ["$transactionType", "cr"]}, "$transactionAmount", 0]
                            }
                        },
                        totalDebit: {
                            $sum: {
                                $cond: [{$eq: ["$transactionType", "dr"]}, "$transactionAmount", 0]
                            }
                        },
                        totalTransactions: {$sum: 1}
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalCredit: 1,
                        totalDebit: 1,
                        totalTransactions: 1,
                        totalAmount: {$subtract: ["$totalCredit", "$totalDebit"]}
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

module.exports = {
    createData,
    getData,
    updateData,
    deleteData,
    findByAccountNo,
    getTransactionSummary,
    getPaginatedTransactions,
    getDashboardStats
}