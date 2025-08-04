const CashSummary = require("../model/CashierSummary");

// ټول ثبت شوي ریکارډونه راوړل
exports.getAllCashSummary = async (req, res) => {
  try {
    const data = await CashSummary.find();
    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// د ډیرو کرنسي ریکارډونو یوځای ثبتول
exports.addBulkCashSummary = async (req, res) => {
  try {
    const entries = req.body.data; // یو ارایه د اشیاؤ [{currency, amount, location, bankName}, ...]

    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ success: false, message: "د ثبتولو لپاره هیڅ معلومات نشته" });
    }

    const inserted = await CashSummary.insertMany(entries);
    res.status(201).json({ success: true, data: inserted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
