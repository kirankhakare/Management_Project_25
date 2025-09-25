const mongoose = require("mongoose");

const userWorkSchema = new mongoose.Schema({
  name: { type: String, required: true }, // user name
  sqft: String,
  from: String,
  malPlus: Number,
  kating: Number,
  total: Number,
  date: { type: Date, default: Date.now },
  paymentStatus: { type: String, enum: ["Paid", "Unpaid"], default: "Unpaid" },
  paidAmount: Number
});

module.exports = mongoose.model("UserWork", userWorkSchema);
