const express = require("express");
const router = express.Router();
const userWorkController = require("../controllers/userWorkController");

// Create work entry
router.post("/", userWorkController.createWork);

// Search users for autocomplete
router.get("/search", userWorkController.searchUserByName);

router.get("/weeklyReportByName", userWorkController.getWeeklyReportByName);

module.exports = router;
