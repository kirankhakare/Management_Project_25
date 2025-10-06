import { useState } from "react";
import { Box, Typography, TextField, Button, Paper } from "@mui/material";
import axios from "axios";

export default function KGNReport() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    if (!fromDate || !toDate) {
      alert("Please select both From and To dates");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/userWork/kgnReport", {
        params: { fromDate, toDate },
      });
      setEntries(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch KGN data");
    }
    setLoading(false);
  };

  return (
    <Box sx={{ width: "100%", mt: 4, px: 2 }}>
      <Typography variant="h4" gutterBottom align="center">
        KGN Work Report (By Date)
      </Typography>

      {/* Date Range */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 3,
        }}
      >
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
        <Button
          variant="contained"
          color="primary"
          onClick={fetchReport}
          sx={{ minWidth: 150 }}
        >
          Show Report
        </Button>
      </Box>

      {/* Table */}
      {loading ? (
        <Typography align="center">Loading...</Typography>
      ) : entries.length > 0 ? (
        <Paper sx={{ p: 2, overflowX: "auto", width: "100%" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "center",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#1976d2", color: "white" }}>
                <th style={{ padding: "10px", border: "1px solid #1976d2" }}>Sr No</th>
                <th style={{ padding: "10px", border: "1px solid #1976d2" }}>From</th>
                <th style={{ padding: "10px", border: "1px solid #1976d2" }}>Sq. Ft.</th>
                <th style={{ padding: "10px", border: "1px solid #1976d2" }}>Total</th>
                <th style={{ padding: "10px", border: "1px solid #1976d2" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{i + 1}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{e.from}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{e.sqft}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{e.total}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                    {new Date(e.date).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Paper>
      ) : (
        <Typography align="center">No entries found for KGN.</Typography>
      )}
    </Box>
  );
}
