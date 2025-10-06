import { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Paper } from "@mui/material";
import axios from "axios";
import DayWiseTable from "../components/DayWiseTable";

export default function WeeklyReportAllUsers() {
  const [selectedDate, setSelectedDate] = useState("");
  const [report, setReport] = useState([]);
  const [showDailyControls, setShowDailyControls] = useState(false);
  const [weekEntries, setWeekEntries] = useState([]);

  useEffect(() => {
    const fetchWeekEntries = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/userWork/weekEntriesDayWise"
        );
        setWeekEntries(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch week entries");
      }
    };
    fetchWeekEntries();
  }, []);

  const fetchDailyReport = async () => {
    if (!selectedDate) {
      alert("Select a date");
      return;
    }
    try {
      const res = await axios.get(
        "http://localhost:5000/api/userWork/getweeklyReportAllUsers",
        { params: { monday: selectedDate } }
      );

      if (!res.data || res.data.length === 0) {
        alert("No entries found for this week");
        setReport([]);
        return;
      }

      const selectedDayEntries = res.data.filter(
        (entry) =>
          new Date(entry.date).toDateString() ===
          new Date(selectedDate).toDateString()
      );

      setReport(selectedDayEntries);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch report");
    }
  };

  const handlePrint = () => {
    if (!report || report.length === 0) return;
    const printContent = document.getElementById("reportTable").innerHTML;
    const newWin = window.open("", "_blank");
    newWin.document.write(`
      <html>
        <head>
          <title>Daily Report</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            table { border-collapse: collapse; width: 100%; margin-top: 10px; }
            th, td { border: 1px solid #333; padding: 8px; text-align: center; }
            th { background-color: #1976d2; color: white; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    newWin.document.close();
    newWin.print();
  };

  const getDayName = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", { weekday: "long" });
  };

  return (
    <Box sx={{ width: "100%", maxWidth: "1200px", mx: "auto", mt: 5, p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, alignItems: "center" }}>
        <Typography variant="h4">Daily Report</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowDailyControls(!showDailyControls)}
        >
          {showDailyControls ? "Hide Daily Controls" : "Show Daily Report"}
        </Button>
      </Box>

      {/* Daily Controls */}
      {showDailyControls && (
        <Box sx={{ display: "flex", gap: 2, mb: 3, width: "100%", flexWrap: "wrap" }}>
          <TextField
            label="Select Date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ flex: "1 1 200px" }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={fetchDailyReport}
            sx={{ flex: "0 0 200px" }}
          >
            Fetch Daily Report
          </Button>
        </Box>
      )}

      {/* Daily Report Table */}
      {report.length > 0 && (
        <Paper id="reportTable" sx={{ p: 2, mb: 3, width: "100%", overflowX: "auto" }}>
          <Typography variant="h6" gutterBottom align="center">
            Date: {new Date(selectedDate).toLocaleDateString("en-GB")} | Day: {getDayName(selectedDate)}
          </Typography>

          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ backgroundColor: "#1976d2", color: "white" }}>
                <th>Sr.No</th>
                <th>Party Name</th>
                <th>Item</th>
                <th>Sq.Ft</th>
                <th>From</th>
                <th>Address</th>
                <th>Mal+</th>
                <th>Kating</th>
                <th>Total</th>
                <th>Paid Amount</th>
                <th>Unpaid Amount</th>
              </tr>
            </thead>
            <tbody>
              {report.map((e, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #ddd" }}>
                  <td>{i + 1}</td>
                  <td>{e.name}</td>
                  <td>{e.item || "-"}</td>
                  <td>{e.sqft || 0}</td>
                  <td>{e.from || "-"}</td>
                  <td>{e.partyTo || "-"}</td>
                  <td>{e.malPlus || 0}</td>
                  <td>{e.kating || 0}</td>
                  <td style={{ fontWeight: "bold" }}>{e.total || 0}</td>
                  <td style={{ color: "#2e7d32", fontWeight: "bold" }}>{e.paidAmount || 0}</td>
                  <td style={{ color: (e.unpaidAmount || 0) > 0 ? "#d32f2f" : "#2e7d32", fontWeight: "bold" }}>
                    {e.unpaidAmount || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Button variant="contained" color="secondary" sx={{ mt: 2 }} onClick={handlePrint}>
            Print Report
          </Button>
        </Paper>
      )}

      {/* Week Table */}
      <Typography variant="h4" gutterBottom align="center" sx={{ mt: 5 }}>
        Week Report
      </Typography>
      <DayWiseTable weekEntries={weekEntries} getDayName={getDayName} />
    </Box>
  );
}
