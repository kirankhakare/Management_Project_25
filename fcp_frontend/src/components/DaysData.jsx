import { useState } from "react";
import { Box, Typography, TextField, Button, Paper } from "@mui/material";
import axios from "axios";

export default function WeeklyReportAllUsers() {
  const [selectedDate, setSelectedDate] = useState("");
  const [report, setReport] = useState([]);

  const fetchReport = async () => {
    if (!selectedDate) {
      alert("Select a date");
      return;
    }
    try {
      const res = await axios.get("http://localhost:5000/api/userWork/getweeklyReportAllUsers", {
        params: { monday: selectedDate }, 
      });

      if (!res.data || res.data.length === 0) {
        alert("No entries found for this week");
        setReport([]);
        return;
      }
      const selectedDayEntries = res.data.filter(
        (entry) => new Date(entry.date).toDateString() === new Date(selectedDate).toDateString()
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
      </html>`);
    newWin.document.close();
    newWin.print();
  };
  const getDayName = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", { weekday: "long" });
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", mt: 5, p: 3 }}>
      <Typography variant="h4" gutterBottom align="center">Daily Report</Typography>

      <TextField
        label="Select Date"
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        InputLabelProps={{ shrink: true }}
      />

      <Button variant="contained" color="primary" fullWidth sx={{ mb: 3 }} onClick={fetchReport}>
        Show Data
      </Button>

      {report.length > 0 && (
        <Paper id="reportTable" sx={{ p: 3, mb: 3, overflowX: "auto" }}>
          <Typography variant="h6" gutterBottom align="center">
            Date: {new Date(selectedDate).toLocaleDateString("en-GB")} | Day: {getDayName(selectedDate)}
          </Typography>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "center",
              tableLayout: "fixed", 
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#1976d2", color: "white" }}>
                <th style={{ padding: "10px", width: "5%" }}>Sr.No</th>
                <th style={{ padding: "10px", width: "12%" }}>User Name</th>
                <th style={{ padding: "10px", width: "12%" }}>Item</th>
                <th style={{ padding: "10px", width: "8%" }}>Sq.Ft</th>
                <th style={{ padding: "10px", width: "12%" }}>From</th>
                <th style={{ padding: "10px", width: "12%" }}>Party To</th>
                <th style={{ padding: "10px", width: "8%" }}>Mal+</th>
                <th style={{ padding: "10px", width: "8%" }}>Kating</th>
                <th style={{ padding: "10px", width: "10%" }}>Total</th>
                <th style={{ padding: "10px", width: "10%" }}>Paid Amount</th>
                <th style={{ padding: "10px", width: "10%" }}>Unpaid Amount</th>
              </tr>
            </thead>
            <tbody>
              {report.map((e, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "8px" }}>{i + 1}</td>
                  <td style={{ padding: "8px" }}>{e.name}</td>
                  <td style={{ padding: "8px" }}>{e.item || "-"}</td>
                  <td style={{ padding: "8px" }}>{e.sqft || 0}</td>
                  <td style={{ padding: "8px" }}>{e.from || "-"}</td>
                  <td style={{ padding: "8px" }}>{e.partyTo || "-"}</td>
                  <td style={{ padding: "8px" }}>{e.malPlus || 0}</td>
                  <td style={{ padding: "8px" }}>{e.kating || 0}</td>
                  <td style={{ padding: "8px", fontWeight: "bold" }}>{e.total || 0}</td>

                  <td
                    style={{
                      padding: "8px",
                      fontWeight: "bold",
                      color: "#2e7d32", 
                    }}
                  >
                    {e.paidAmount || 0}
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      fontWeight: "bold",
                      color: (e.unpaidAmount || 0) > 0 ? "#d32f2f" : "#2e7d32",
                    }}
                  >
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
    </Box>
  );
}
