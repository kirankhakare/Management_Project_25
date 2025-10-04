const mongoose = require("mongoose");

const userWorkSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sqft: String,
  item: String,
  from: String,
  partyTo: String,
  malPlus: { type: Number, default: 0 },
  kating: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
  paymentStatus: { type: String, enum: ["Paid", "Unpaid"], default: "Unpaid" },
  paidAmount: { type: Number, default: 0 },
  paymentMode: { type: String, enum: ["Cash", "Online"], default: "Cash" } // new field
});

module.exports = mongoose.model("UserWork", userWorkSchema);
