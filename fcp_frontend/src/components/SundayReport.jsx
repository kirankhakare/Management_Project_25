import { useState } from "react";
import { Box, Typography, TextField, Button, Paper } from "@mui/material";
import axios from "axios";
import AllPendingPayments from "../components/AllPendingPayments";
import AllUsersGadiReport from "../components/AllUsersGadiReport";
import KGNReport from "../components/KGNReport"; 

export default function WeeklySundayReport() {
  const [selectedSunday, setSelectedSunday] = useState("");
  const [report, setReport] = useState([]);
  const [totalRemaining, setTotalRemaining] = useState(0);
  const [showGadiReport, setShowGadiReport] = useState(false);
  const [showKGNReport, setShowKGNReport] = useState(false); 

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

      const total = res.data.reduce((acc, curr) => acc + (curr.remainingAmount || 0), 0);
      setReport(res.data);
      setTotalRemaining(total);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch report");
    }
  };

  return (
    <Box sx={{ width: "100%", mx: "auto", mt: 4, px: 2 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          gap: 2,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Weekly Report (Sunday)
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            color={showGadiReport ? "error" : "secondary"}
            onClick={() => setShowGadiReport(!showGadiReport)}
            sx={{ minWidth: "200px" }}
          >
            {showGadiReport ? "Close Gadi Report" : "Open All Users Gadi Report"}
          </Button>

          <Button
            variant="contained"
            color={showKGNReport ? "error" : "success"}
            onClick={() => setShowKGNReport(!showKGNReport)}
            sx={{ minWidth: "180px" }}
          >
            {showKGNReport ? "Close KGN Report" : "Open KGN Report"}
          </Button>
        </Box>
      </Box>
      <TextField
        label="Select Sunday"
        type="date"
        value={selectedSunday}
        onChange={(e) => setSelectedSunday(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        InputLabelProps={{ shrink: true }}
      />

      {/* Fetch Button */}
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
        <Paper
          sx={{
            p: 2,
            overflowX: "auto",
            width: "100%",
            mb: 4,
            boxShadow: 3,
            borderRadius: 2,
          }}
        >
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
                <th style={{ padding: "10px", border: "1px solid #1976d2" }}>Sr. No</th>
                <th style={{ padding: "10px", border: "1px solid #1976d2" }}>Party Name</th>
                <th style={{ padding: "10px", border: "1px solid #1976d2" }}>Address</th>
                <th style={{ padding: "10px", border: "1px solid #1976d2" }}>Date</th>
                <th style={{ padding: "10px", border: "1px solid #1976d2" }}>Remaining Amount</th>
                <th style={{ padding: "10px", border: "1px solid #1976d2" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {report.map((e, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom: "1px solid #ddd",
                    backgroundColor: e.remainingAmount === 0 ? "#e8f5e9" : "white",
                  }}
                >
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{i + 1}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{e.name}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{e.partyTo}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {new Date(e.date).toLocaleDateString("en-GB")}
                  </td>
                  <td
                    style={{
                      padding: "10px",
                      border: "1px solid #ddd",
                      color: e.remainingAmount > 0 ? "#d32f2f" : "#2e7d32",
                      fontWeight: 600,
                    }}
                  >
                    {e.remainingAmount}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{e.total}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: "#f4f6f8", fontWeight: "bold" }}>
                <td colSpan={4} style={{ padding: "10px", textAlign: "right" }}>
                  Total Remaining:
                </td>
                <td style={{ padding: "10px", color: "#d32f2f" }}>{totalRemaining}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </Paper>
      )}
      {showGadiReport && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            All Users Gadi Report
          </Typography>
          <AllUsersGadiReport />
        </Box>
      )}
      {showKGNReport && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            KGN Report
          </Typography>
          <KGNReport />
        </Box>
      )}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          All Pending Payments
        </Typography>
        <AllPendingPayments />
      </Box>
    </Box>
  );
}
