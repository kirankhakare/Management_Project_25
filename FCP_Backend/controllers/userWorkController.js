// controllers/userWorkController.js
const UserWork = require("../models/UserWork");

// ➡️ Create new work entry
exports.createWork = async (req, res) => {
  try {
    const { name, sqft, from, malPlus, kating, date, paymentStatus, paidAmount, addUser } = req.body;

    if (!name) return res.status(400).json({ message: "User name is required" });

    // Check if user exists
    const existingUser = await UserWork.findOne({ name });

    // If user is new and frontend hasn't confirmed adding yet
    if (!existingUser && !addUser) {
      return res.status(200).json({ isNewUser: true, message: "User does not exist" });
    }

    // Calculate total
    const totalAmount = (parseFloat(malPlus) || 0) + (parseFloat(kating) || 0);

    // Save work entry
    const newWork = new UserWork({
      name,
      sqft,
      from,
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

// ➡️ Search users for autocomplete
// Search users for autocomplete
exports.searchUserByName = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.json([]);

    // Find matching names (case-insensitive)
    const users = await UserWork.find({ name: { $regex: name, $options: "i" } })
      .distinct("name") // unique name;

    res.json(users);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error searching users", error: error.message });
  }
};

// Controller: weeklyReportByName

exports.getWeeklyReportByName = async (req, res) => {
  try {
    const { name, sunday } = req.query; // sunday = selected Sunday date
    if (!name || !sunday) return res.status(400).json({ message: "Name and Sunday date required" });

    const selectedSunday = new Date(sunday);
    selectedSunday.setHours(23, 59, 59, 999);

    // Monday = Sunday - 6 days
    const monday = new Date(selectedSunday);
    monday.setDate(selectedSunday.getDate() - 6);
    monday.setHours(0, 0, 0, 0);

    // Fetch entries between Monday and Sunday
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
      return { ...e.toObject(), remainingAmount: totalAmount - totalPaid };
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



