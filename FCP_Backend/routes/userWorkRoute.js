const express = require("express");
const router = express.Router();
const userWorkController = require("../controllers/userWorkController");

router.post("/", userWorkController.createWork);

router.get("/search", userWorkController.searchUserByName);

router.get("/weeklyReportByName", userWorkController.getWeeklyReportByName);

router.get("/getweeklyReportAllUsers", userWorkController.getWeeklyReportAllUsers);

router.get("/pending", userWorkController.getPendingPayments);
router.post("/pay", userWorkController.payRemainingAmount);
router.get("/weeklySundayReport", userWorkController.getWeeklySundayReport);

module.exports = router;
