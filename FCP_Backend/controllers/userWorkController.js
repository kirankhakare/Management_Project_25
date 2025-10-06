const UserWork = require("../models/UserWork");
const allowedItems = ["Reti", "1/4", "Crush", "Malma", "Gitti"];
const allowedPaymentModes = ["Cash", "Online"];
const allowedPaymentStatus = ["Paid", "Unpaid"];
const allowedVehicleNos = ["K101", "K102"];

exports.createWork = async (req, res) => {
  try {
    let { name, sqft, item, from, partyTo, malPlus, kating, date, paymentStatus, paidAmount, addUser, paymentMode, vehicleNo } = req.body;

    if (!name) return res.status(400).json({ message: "User name is required" });

    // Check if user exists
    const existingUser = await UserWork.findOne({ name });
    if (!existingUser && !addUser) {
      return res.status(200).json({ isNewUser: true, message: "User does not exist" });
    }

    // Normalize item
    const normalizedItem = allowedItems.find(i => i.toLowerCase() === (item || "").toLowerCase());
    if (!normalizedItem) {
      return res.status(400).json({ message: `${item || "undefined"} is not a valid item` });
    }

    // Normalize paymentStatus
    paymentStatus = allowedPaymentStatus.includes(paymentStatus) ? paymentStatus : "Unpaid";

    // Normalize paymentMode (only if Paid)
    if (paymentStatus === "Paid") {
      paymentMode = allowedPaymentModes.includes(paymentMode) ? paymentMode : "Cash";
      paidAmount = parseFloat(paidAmount) || 0;
    } else {
      paymentMode = undefined;
      paidAmount = 0;
    }

    // Normalize vehicleNo
    vehicleNo = allowedVehicleNos.includes(vehicleNo) ? vehicleNo : allowedVehicleNos[0];

    // Calculate total
    const totalAmount = (parseFloat(malPlus) || 0) + (parseFloat(kating) || 0);

    const newWork = new UserWork({
      name,
      sqft,
      item: normalizedItem,
      from,
      partyTo,
      malPlus: parseFloat(malPlus) || 0,
      kating: parseFloat(kating) || 0,
      total: totalAmount,
      date: date || new Date(),
      paymentStatus,
      paidAmount,
      paymentMode,
      vehicleNo,
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
        paymentMode: e.paymentMode,
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
        paymentMode: obj.paymentMode,
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

    // Normalize item to match schema enum
    const allowedItems = ["Reti", "1/4", "Crush", "Malma", "Gitti"];
    if (entry.item) {
      const normalizedItem = allowedItems.find(i => i.toLowerCase() === entry.item.toLowerCase());
      if (normalizedItem) entry.item = normalizedItem;
      else entry.item = allowedItems[0]; // fallback to first enum value
    }

    entry.paidAmount = currentPaid + amount;
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
    }).sort({ date: 1 });

    if (!entries.length) return res.json([]);

    // Prepare report per entry
    const report = entries.map(e => {
      const remainingAmount = (e.total || 0) - (e.paidAmount || 0);
      return {
        id: e._id,
        name: e.name,
        partyTo: e.partyTo || "-",
        date: e.date,
        total: e.total || 0,
        remainingAmount: remainingAmount,
      };
    });

    res.json(report);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching weekly Sunday report", error: err.message });
  }
};

exports.getWeeklyEntriesDayWise = async (req, res) => {
  try {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 - Sunday, 1 - Monday ...

    // Current week Monday
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);

    // Current week Sunday
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    // Fetch all entries in the week
    const entries = await UserWork.find({
      date: { $gte: monday, $lte: sunday },
    }).sort({ date: 1 });

    // Group by date
    const dayWiseMap = {};
    entries.forEach((e) => {
      const dateKey = e.date.toISOString().split("T")[0]; // YYYY-MM-DD
      if (!dayWiseMap[dateKey]) dayWiseMap[dateKey] = [];
      dayWiseMap[dateKey].push({
        name: e.name,
        item: e.item || "-",
        from:e.from || "KGN",
        partyTo: e.partyTo || "-",
        sqft: e.sqft,
        malPlus: e.malPlus,
        kating: e.kating,
        total: e.total,
        paidAmount: e.paidAmount,
        remainingAmount: (e.total || 0) - (e.paidAmount || 0),
        paymentStatus: e.paymentStatus,
        paymentMode: e.paymentMode || "-",
        vehicleNo: e.vehicleNo || "-", // ← Add vehicleNo here
      });
    });

    // Prepare final list Monday → Sunday
    const result = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      const key = day.toISOString().split("T")[0];

      result.push({
        date: key,
        entries: dayWiseMap[key] || [], // empty array if no entry
      });
    }

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching day-wise weekly entries", error: err.message });
  }
};

// weeklyPendingReport endpoint
exports.getWeeklyPendingReport = async (req, res) => {
  try {
    const entries = await UserWork.find().sort({ date: 1 });

    // Group by user
    const usersMap = {};
    entries.forEach(e => {
      const remaining = (e.total || 0) - (e.paidAmount || 0);
      if (!usersMap[e.name]) usersMap[e.name] = [];
      usersMap[e.name].push({
        date: e.date,
        partyTo: e.partyTo || "-",
        total: e.total || 0,
        remainingAmount: remaining,
      });
    });

    const result = Object.keys(usersMap).map(name => ({
      name,
      entries: usersMap[name],
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch weekly pending report" });
  }
};

// Get all entries filtered by Gadi No
exports.getAllByGadiNo = async (req, res) => {
  try {
    const { vehicleNo } = req.query;

    const query = {};
    if (vehicleNo && vehicleNo !== "All") {
      query.vehicleNo = vehicleNo;
    }

    const entries = await UserWork.find(query).sort({ date: -1 });

    const result = entries.map((e) => ({
      name: e.name,
      from: e.from || "-",
      partyTo: e.partyTo || "-",
      vehicleNo: e.vehicleNo || "-",
      date: e.date,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch entries", error: err.message });
  }
};

exports.getKGNReport = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query; // Match frontend params

    if (!fromDate || !toDate) {
      return res.status(400).json({ message: "From and To dates are required" });
    }
    const from = new Date(fromDate);
    from.setHours(0, 0, 0, 0);

    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    const entries = await UserWork.find({
      from: "KGN",
      date: { $gte: from, $lte: to },
    }).sort({ date: -1 });

    if (!entries.length) {
      return res.json([]);
    }
    const report = entries.map((e, index) => ({
      srNo: index + 1,
      from: e.from || "-",
      sqft: e.sqft || 0,
      total: e.total || 0,
      date: e.date,
    }));

    res.json(report);
  } catch (err) {
    console.error("Error in getKGNReport:", err);
    res.status(500).json({ message: "Error fetching KGN report", error: err.message });
  }
};









