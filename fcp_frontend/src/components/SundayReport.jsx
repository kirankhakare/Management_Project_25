import { useState } from "react";
import { Box, Typography, TextField, Button, Paper } from "@mui/material";
import axios from "axios";

export default function WeeklySundayReport() {
  const [selectedSunday, setSelectedSunday] = useState("");
  const [report, setReport] = useState([]);
  const [totalRemaining, setTotalRemaining] = useState(0);

  const fetchReport = async () => {
    if (!selectedSunday) {
      alert("Select Sunday date");
      return;
    }

    try {
      const res = await axios.get("http://localhost:5000/api/userWork/weeklySundayReport", {
        params: { sunday: selectedSunday },
      });

      if (!res.data || res.data.length === 0) {
        alert("No entries found for this week");
        setReport([]);
        setTotalRemaining(0);
        return;
      }

      // Calculate total remaining
      const total = res.data.reduce((acc, curr) => acc + (curr.remainingAmount || 0), 0);

      setReport(res.data);
      setTotalRemaining(total);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch report");
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 5, p: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        Weekly Report (Sunday)
      </Typography>

      <TextField
        label="Select Sunday"
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
        Show Weekly Report
      </Button>

      {report.length > 0 && (
        <Paper sx={{ p: 3, overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "center",
              fontSize: "14px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#1976d2", color: "white" }}>
                <th>User Name</th>
                <th>Remaining Amount</th>
              </tr>
            </thead>
            <tbody>
              {report.map((e, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #ddd" }}>
                  <td>{e.name}</td>
                  <td style={{ color: (e.remainingAmount || 0) > 0 ? "#d32f2f" : "#2e7d32" }}>
                    {e.remainingAmount || 0}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: "#f4f6f8", fontWeight: "bold" }}>
                <td style={{ padding: "10px", textAlign: "right" }}>Total Remaining:</td>
                <td style={{ padding: "10px", color: "#d32f2f" }}>{totalRemaining}</td>
              </tr>
            </tfoot>
          </table>
        </Paper>
      )}
    </Box>
  );
}
