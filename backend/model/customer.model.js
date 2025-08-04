const mongo = require("mongoose");
const { Schema } = mongo;

const customersSchema = new Schema({
  accountNo: Number,
  fullname: String,
  mobile: String,
  fatherName: String,
  email: {
    type: String,
    unique: true,
  },
  dob: String,
  gender: String,

  // Remove single currency, add balances array instead
  balances: [
    {
      currency: { type: String, required: true },
      balance: { type: Number, default: 0 },
    },
  ],

  key: String,
  profile: String,
  signature: String,
  document: String,
  address: String,
  userType: String,
  branch: String,
  createdBy: String,
  customerLoginId: String,
  isActive: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongo.model("customer", customersSchema);
