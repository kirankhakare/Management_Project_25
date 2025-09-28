const express = require("express");
const router = express.Router();
const userWorkController = require("../controllers/userWorkController");

router.post("/", userWorkController.createWork);

router.get("/search", userWorkController.searchUserByName);

router.get("/weeklyReportByName", userWorkController.getWeeklyReportByName);

router.get("/getweeklyReportAllUsers", userWorkController.getWeeklyReportAllUsers);

module.exports = router;
