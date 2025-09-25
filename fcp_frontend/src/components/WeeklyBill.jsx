import { useState } from "react";
import { Box, Typography, TextField, Button, Autocomplete, Paper } from "@mui/material";
import axios from "axios";

export default function WeeklyReport() {
  const [userOptions, setUserOptions] = useState([]);
  const [selectedName, setSelectedName] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [selectedSunday, setSelectedSunday] = useState("");
  const [report, setReport] = useState(null);

  // Autocomplete fetch
  const fetchSuggestions = async (name) => {
    if (!name) return setUserOptions([]);
    try {
      const res = await axios.get("http://localhost:5000/api/userWork/search", { params: { name } });
      setUserOptions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
    if (newInputValue.length >= 1) fetchSuggestions(newInputValue);
  };

  // Fetch weekly report
  const fetchReport = async () => {
    if (!selectedName || !selectedSunday) {
      alert("Select user and Sunday date");
      return;
    }

    try {
      const res = await axios.get("http://localhost:5000/api/userWork/weeklyReportByName", {
        params: { name: selectedName, sunday: selectedSunday },
      });

      if (!res.data.entries || res.data.entries.length === 0) {
        alert("No entries found for this week");
        setReport(null);
        return;
      }

      setReport(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch report");
    }
  };

  // Print report
  const handlePrint = () => {
    if (!report) return;
    const printContent = document.getElementById("billPreview").innerHTML;
    const newWin = window.open("", "_blank");
    newWin.document.write(`
      <html>
        <head>
          <title>Weekly Report</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th, td { border: 1px solid #333; padding: 8px; text-align: center; }
            th { background-color: #1976d2; color: white; }
            tfoot td { font-weight: bold; background-color: #f0f0f0; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>`);
    newWin.document.close();
    newWin.print();
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 5, p: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        Weekly Report
      </Typography>

      <Autocomplete
        freeSolo
        options={userOptions}
        value={selectedName}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onChange={(e, newValue) => setSelectedName(newValue)}
        renderInput={(params) => <TextField {...params} label="User Name" fullWidth sx={{ mb: 2 }} />}
      />

      <TextField
        label="Select Sunday of the week"
        type="date"
        value={selectedSunday}
        onChange={(e) => setSelectedSunday(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        InputLabelProps={{ shrink: true }}
      />

      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mb: 3 }}
        onClick={fetchReport}
      >
        Show Report
      </Button>

      {report && report.entries.length > 0 && (
      <Paper id="billPreview" sx={{ p: 3, mb: 3, overflowX: "auto" }}>
  <Typography variant="h6" gutterBottom>
    User: {report.userName} | Week: {new Date(selectedSunday).toLocaleDateString("en-GB")} (Mon-Sat)
  </Typography>

  <table style={{
      width: "100%",
      borderCollapse: "collapse",
      textAlign: "center",
      marginTop: "10px"
  }}>
    <thead>
      <tr style={{ backgroundColor: "#f0f0f0" }}>
        <th style={{ border: "1px solid #ccc", padding: "8px" }}>Date</th>
        <th style={{ border: "1px solid #ccc", padding: "8px" }}>Sqft</th>
        <th style={{ border: "1px solid #ccc", padding: "8px" }}>From</th>
        <th style={{ border: "1px solid #ccc", padding: "8px" }}>Total</th>
        <th style={{ border: "1px solid #ccc", padding: "8px" }}>Paid</th>
        <th style={{ border: "1px solid #ccc", padding: "8px" }}>Remaining</th>
      </tr>
    </thead>
    <tbody>
      {report.entries.map((e, i) => (
        <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
          <td style={{ border: "1px solid #ccc", padding: "8px" }}>{new Date(e.date).toLocaleDateString("en-GB")}</td>
          <td style={{ border: "1px solid #ccc", padding: "8px" }}>{e.sqft || 0}</td>
          <td style={{ border: "1px solid #ccc", padding: "8px" }}>{e.from || "-"}</td>
          <td style={{ border: "1px solid #ccc", padding: "8px" }}>{e.total || 0}</td>
          <td style={{ border: "1px solid #ccc", padding: "8px" }}>{e.paidAmount || 0}</td>
          <td style={{ border: "1px solid #ccc", padding: "8px" }}>{e.remainingAmount || 0}</td>
        </tr>
      ))}
    </tbody>
    <tfoot>
      <tr style={{ backgroundColor: "#f9f9f9" }}>
        <td colSpan={3} style={{ border: "1px solid #ccc", padding: "8px" }}><b>Total</b></td>
        <td style={{ border: "1px solid #ccc", padding: "8px" }}><b>{report.totalAmount}</b></td>
        <td style={{ border: "1px solid #ccc", padding: "8px" }}><b>{report.totalPaid}</b></td>
        <td style={{ border: "1px solid #ccc", padding: "8px" }}><b>{report.totalRemaining}</b></td>
      </tr>
    </tfoot>
  </table>

  <Button
    variant="contained"
    color="secondary"
    sx={{ mt: 2 }}
    onClick={handlePrint}
  >
    Print Report
  </Button>
</Paper>

      )}
    </Box>
  );
}
