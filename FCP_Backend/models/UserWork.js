const mongoose = require("mongoose");

const userWorkSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sqft: String,
  item: { 
    type: String, 
    enum: ["Reti", "1/4", "Crush", "Malma", "Gitti"], // ← allowed options
    default: "Reti"
  },
  from: String,
  partyTo: String,
  malPlus: { type: Number, default: 0 },
  kating: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
  paymentStatus: { type: String, enum: ["Paid", "Unpaid"], default: "Unpaid" },
  paidAmount: { type: Number, default: 0 },
  paymentMode: {
    type: String,
    enum: ["Cash", "Online"],
    required: false,        
    default: undefined,     
  },
  vehicleNo: { type: String, enum: ["K101", "K102"], default: "K101" } 
});

module.exports = mongoose.model("UserWork", userWorkSchema);
