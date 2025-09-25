const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const userWorkRouter = require("./routes/userWorkRoute");
const cors = require("cors");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/userWork", userWorkRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
