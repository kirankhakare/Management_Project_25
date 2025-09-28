const UserWork = require("../models/UserWork");

exports.createWork = async (req, res) => {
  try {
    const { name, sqft, item, from, partyTo, malPlus, kating, date, paymentStatus, paidAmount, addUser } = req.body;

    if (!name) return res.status(400).json({ message: "User name is required" });

    const existingUser = await UserWork.findOne({ name });

    if (!existingUser && !addUser) {
      return res.status(200).json({ isNewUser: true, message: "User does not exist" });
    }
    const totalAmount = (parseFloat(malPlus) || 0) + (parseFloat(kating) || 0);
    const newWork = new UserWork({
      name,
      sqft,
      item,       
      from,
      partyTo,    
      malPlus,
      kating,
      total: totalAmount,
      date: date || new Date(),
      paymentStatus,
      paidAmount: paymentStatus === "Paid" ? paidAmount : 0,
    });

    await newWork.save();
    res.status(201).json({ work: newWork, isNewUser: !existingUser });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add work", error: error.message });
  }
};

exports.searchUserByName = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.json([]);

    const users = await UserWork.find({ name: { $regex: name, $options: "i" } })
      .distinct("name") 

    res.json(users);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error searching users", error: error.message });
  }
};

exports.getWeeklyReportByName = async (req, res) => {
  try {
    const { name, sunday } = req.query; 
    if (!name || !sunday) return res.status(400).json({ message: "Name and Sunday date required" });

    const selectedSunday = new Date(sunday);
    selectedSunday.setHours(23, 59, 59, 999);

    const monday = new Date(selectedSunday);
    monday.setDate(selectedSunday.getDate() - 6);
    monday.setHours(0, 0, 0, 0);

    const entries = await UserWork.find({
      name,
      date: { $gte: monday, $lte: selectedSunday },
    }).sort({ date: 1 });

    if (!entries.length) return res.json({ entries: [], message: "No entries found for this week" });

    let totalAmount = 0;
    let totalPaid = 0;

    const updatedEntries = entries.map((e) => {
      totalAmount += e.total || 0;
      totalPaid += e.paidAmount || 0;
      return { ...e.toObject(), remainingAmount: totalAmount - totalPaid ,  item: e.item,       
    partyTo: e.partyTo  };
    });

    res.json({
      userName: name,
      entries: updatedEntries,
      totalAmount,
      totalPaid,
      totalRemaining: totalAmount - totalPaid,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching weekly report" });
  }
};


exports.getWeeklyReportAllUsers = async (req, res) => {
  try {
    const { monday } = req.query;
    if (!monday) return res.status(400).json({ message: "Monday date required" });
    const mondayDate = new Date(monday);
    mondayDate.setHours(0, 0, 0, 0);

    const saturdayDate = new Date(mondayDate);
    saturdayDate.setDate(mondayDate.getDate() + 5); 
    saturdayDate.setHours(23, 59, 59, 999);

    const entries = await UserWork.find({
      date: { $gte: mondayDate, $lte: saturdayDate },
    }).sort({ date: 1 });

    if (!entries.length) return res.json([]);

    const updatedEntries = entries.map((e) => {
      const obj = e.toObject();
      return {
        ...obj,
        unpaidAmount: (obj.total || 0) - (obj.paidAmount || 0),
      };
    });

    res.json(updatedEntries);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching weekly report for all users", error: err.message });
  }
};

