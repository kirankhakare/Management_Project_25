import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Autocomplete,
  Paper,
} from "@mui/material";
import axios from "axios";
import DayWiseTable from "../components/DayWiseTable";

export default function WeeklyReport() {
  const [userOptions, setUserOptions] = useState([]);
  const [selectedName, setSelectedName] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [report, setReport] = useState(null);
  const [weekEntries, setWeekEntries] = useState([]);

  const fetchSuggestions = async (name) => {
    if (!name) return setUserOptions([]);
    try {
      const res = await axios.get(
        "http://localhost:5000/api/userWork/search",
        { params: { name } }
      );
      setUserOptions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
    if (newInputValue.length >= 1) fetchSuggestions(newInputValue);
  };

  const fetchReport = async () => {
    if (!selectedName || !fromDate || !toDate) {
      alert("Select user and date range");
      return;
    }

    try {
      const res = await axios.get(
        "http://localhost:5000/api/userWork/weeklyReportByName",
        { params: { name: selectedName, from: fromDate, to: toDate } }
      );

      if (!res.data.entries || res.data.entries.length === 0) {
        alert("No entries found for this period");
        setReport(null);
        return;
      }

      setReport(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch report");
    }
  };

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
          </style>
        </head>
        <body>${printContent}</body>
      </html>`);
    newWin.document.close();
    newWin.print();
  };

  const getDayName = (date) =>
    new Date(date).toLocaleDateString("en-US", { weekday: "long" });

  return (
    <Box sx={{ width: "100%", p: { xs: 2, md: 5 } }}>
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
        renderInput={(params) => (
          <TextField {...params} label="Party Name" fullWidth sx={{ mb: 2 }} />
        )}
      />

      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <TextField
          label="From Date"
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="To Date"
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mb: 3 }}
        onClick={fetchReport}
      >
        Show Report
      </Button>

      {/* Main report table */}
      {report && report.entries.length > 0 && (
        <Paper
          id="billPreview"
          sx={{ p: 3, mb: 3, overflowX: "auto", width: "100%" }}
        >
          <Typography variant="h6" gutterBottom>
            User: {report.userName} | Date Range:{" "}
            {new Date(fromDate).toLocaleDateString("en-GB")} -{" "}
            {new Date(toDate).toLocaleDateString("en-GB")}
          </Typography>

          <Box sx={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "center",
                tableLayout: "fixed",
                marginTop: "15px",
                fontSize: "14px",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#1976d2", color: "white" }}>
                  <th style={{ padding: "10px" }}>Date</th>
                  <th style={{ padding: "10px" }}>Sqft</th>
                  <th style={{ padding: "10px" }}>Item</th>
                  <th style={{ padding: "10px" }}>From</th>
                  <th style={{ padding: "10px" }}>Address</th>
                  <th style={{ padding: "10px" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {report.entries.map((e, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: "1px solid #ddd",
                      backgroundColor: i % 2 === 0 ? "#fafafa" : "white",
                    }}
                  >
                    <td style={{ padding: "8px" }}>
                      {new Date(e.date).toLocaleDateString("en-GB")}
                    </td>
                    <td style={{ padding: "8px" }}>{e.sqft || 0}</td>
                    <td style={{ padding: "8px" }}>{e.item || "-"}</td>
                    <td style={{ padding: "8px" }}>{e.from || "-"}</td>
                    <td style={{ padding: "8px" }}>{e.partyTo || "-"}</td>
                    <td style={{ padding: "8px", fontWeight: "bold" }}>
                      {e.total || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: "#f4f6f8", fontWeight: "bold" }}>
                  <td colSpan={5} style={{ padding: "10px", textAlign: "right" }}>
                    Total:
                  </td>
                  <td style={{ padding: "10px" }}>{report.totalAmount}</td>
                </tr>
              </tfoot>
            </table>
          </Box>

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

      {/* DayWiseTable section */}
      <Typography variant="h4" gutterBottom align="center" sx={{ mt: 5 }}>
        Week Report
      </Typography>
      <DayWiseTable weekEntries={weekEntries} getDayName={getDayName} />
    </Box>
  );
}
