const UserWork = require("../models/UserWork");

exports.createWork = async (req, res) => {
  try {
    const { name, sqft, item, from, partyTo, malPlus, kating, date, paymentStatus, paidAmount, addUser, paymentMode } = req.body;

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
      paidAmount: paymentStatus === "Paid" ? (parseFloat(paidAmount) || 0) : 0,
      paymentMode: paymentMode || "Cash", // new field
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
      .distinct("name");

    res.json(users);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error searching users", error: error.message });
  }
};

// weekly report for single user (current week)
exports.getWeeklyReportByName = async (req, res) => {
  try {
    const { name, from, to } = req.query;

    if (!name) return res.status(400).json({ message: "Name required" });
    if (!from || !to) return res.status(400).json({ message: "From and To dates are required" });

    // Convert to proper Date objects
    const fromDate = new Date(from);
    fromDate.setHours(0, 0, 0, 0); // start of day
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999); // end of day

    // Fetch entries for the user in the date range
    const entries = await UserWork.find({
      name,
      date: { $gte: fromDate, $lte: toDate },
    }).sort({ date: 1 });

    if (!entries.length) {
      return res.json({ entries: [], message: "No entries found for this period" });
    }

    let totalAmount = 0;
    let totalPaid = 0;

    // Map entries and calculate per-entry remaining
    const updatedEntries = entries.map((e) => {
      const entryTotal = e.total || 0;
      const entryPaid = e.paidAmount || 0;
      const remainingAmount = entryTotal - entryPaid;

      totalAmount += entryTotal;
      totalPaid += entryPaid;

      return {
        ...e.toObject(),
        remainingAmount,
        item: e.item || "-",
        partyTo: e.partyTo || "-",
        paymentMode: e.paymentMode || "Cash",
      };
    });

    res.json({
      userName: name,
      entries: updatedEntries,
      totalAmount,
      totalPaid,
      totalRemaining: totalAmount - totalPaid,
    });

  } catch (err) {
    console.error("Error in getWeeklyReportByName:", err);
    res.status(500).json({ message: "Error fetching report", error: err.message });
  }
};

// weekly report for all users (current week)
exports.getWeeklyReportAllUsers = async (req, res) => {
  try {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayDate = new Date(today);
    mondayDate.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    mondayDate.setHours(0, 0, 0, 0);

    const sundayDate = new Date(mondayDate);
    sundayDate.setDate(mondayDate.getDate() + 6);
    sundayDate.setHours(23,59,59,999);

    const entries = await UserWork.find({
      date: { $gte: mondayDate, $lte: sundayDate },
    }).sort({ date: 1 });

    if (!entries.length) return res.json([]);

    const updatedEntries = entries.map((e) => {
      const obj = e.toObject();
      return {
        ...obj,
        unpaidAmount: (obj.total || 0) - (obj.paidAmount || 0),
        paymentMode: obj.paymentMode || "Cash",
      };
    });

    res.json(updatedEntries);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching weekly report for all users", error: err.message });
  }
};

exports.getPendingPayments = async (req, res) => {
  try {
    const { name, partyTo } = req.query;

    if (!name) return res.status(400).json({ message: "User name required" });

    const filter = { name };
    if (partyTo) filter.partyTo = partyTo;

    const entries = await UserWork.find(filter).sort({ date: 1 });

    // Only include entries with remainingAmount > 0
    const pending = entries
      .map(e => ({
        id: e._id,
        name: e.name,
        partyTo: e.partyTo || "-",
        date: e.date,
        total: e.total,
        paidAmount: e.paidAmount || 0,
        remainingAmount: e.total - (e.paidAmount || 0),
      }))
      .filter(e => e.remainingAmount > 0); // ✅ filter fully paid

    res.json(pending);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching pending payments", error: err.message });
  }
};

exports.payRemainingAmount = async (req, res) => {
  try {
    const { entryId, amount } = req.body;
    if (!entryId || amount === undefined) {
      return res.status(400).json({ message: "Entry ID and amount required" });
    }

    const entry = await UserWork.findById(entryId);
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    const currentPaid = entry.paidAmount || 0;
    const remaining = entry.total - currentPaid;

    if (amount > remaining) {
      return res.status(400).json({ message: "Amount exceeds remaining balance" });
    }

    entry.paidAmount = currentPaid + amount;
    // Optional: update paymentStatus if fully paid
    if (entry.paidAmount >= entry.total) entry.paymentStatus = "Paid";

    await entry.save();
    res.json({ message: "Payment successful", entry });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error processing payment", error: err.message });
  }
};

exports.getWeeklySundayReport = async (req, res) => {
  try {
    const { sunday } = req.query;
    if (!sunday) return res.status(400).json({ message: "Sunday date required" });

    const sundayDate = new Date(sunday);
    sundayDate.setHours(23, 59, 59, 999);

    // Calculate Monday of the same week
    const dayOfWeek = sundayDate.getDay(); // 0-Sunday, 1-Monday...
    const mondayDate = new Date(sundayDate);
    mondayDate.setDate(sundayDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    mondayDate.setHours(0, 0, 0, 0);

    // Fetch all entries in that week
    const entries = await UserWork.find({
      date: { $gte: mondayDate, $lte: sundayDate },
    });

    if (!entries.length) return res.json([]);

    // Aggregate remaining amounts by user
    const reportMap = {};
    entries.forEach(e => {
      const remaining = (e.total || 0) - (e.paidAmount || 0);
      if (remaining > 0) {
        if (reportMap[e.name]) reportMap[e.name] += remaining;
        else reportMap[e.name] = remaining;
      }
    });

    const report = Object.keys(reportMap).map(name => ({
      name,
      remainingAmount: reportMap[name],
    }));

    res.json(report);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching weekly Sunday report", error: err.message });
  }
};

