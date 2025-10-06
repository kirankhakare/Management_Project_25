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
router.get("/weekEntriesDayWise", userWorkController.getWeeklyEntriesDayWise);
router.get("/weeklyPendingReport", userWorkController.getWeeklyPendingReport);

router.get("/allByGadiNo", userWorkController.getAllByGadiNo);
router.get("/kgnReport", userWorkController.getKGNReport);

module.exports = router;
