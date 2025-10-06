import { useState, useEffect } from "react";
import { Box, Typography, Paper, Button } from "@mui/material";
import axios from "axios";

export default function AllPendingPayments() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAllPending = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:5000/api/userWork/weeklyPendingReport"
      );
      const grouped = res.data.map((user) => {
        return {
          name: user.name,
          entries: user.entries.map((entry) => ({
            partyTo: entry.partyTo || "-",
            remainingAmount: entry.remainingAmount,
            total: entry.total || 0,
            date: new Date(entry.date).toLocaleDateString(),
          })),
        };
      });
      setPendingUsers(grouped);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch weekly pending report");
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAllPending();
  }, []);

  return (
    <Box sx={{ mt: 3, px: { xs: 1, sm: 3 } }}>
      <Typography variant="h5" gutterBottom align="center">
        Weekly Pending Payments (All Users)
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <Button variant="contained" color="primary" onClick={fetchAllPending}>
          Refresh
        </Button>
      </Box>

      {loading ? (
        <Typography align="center" sx={{ mt: 2 }}>
          Loading...
        </Typography>
      ) : pendingUsers.length > 0 ? (
        <Paper sx={{ p: 2, overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "center",
              minWidth: 600,
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#1976d2", color: "white" }}>
                <th style={{ padding: "12px 8px", border: "1px solid #1976d2" }}>
                  Sr. No
                </th>
                <th style={{ padding: "12px 8px", border: "1px solid #1976d2" }}>
                  Party Name
                </th>
                <th style={{ padding: "12px 8px", border: "1px solid #1976d2" }}>
                  Address
                </th>
                <th style={{ padding: "12px 8px", border: "1px solid #1976d2" }}>
                  Remaining Amount
                </th>
                <th style={{ padding: "12px 8px", border: "1px solid #1976d2" }}>
                  Total
                </th>
                <th style={{ padding: "12px 8px", border: "1px solid #1976d2" }}>
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map((user) =>
                user.entries.map((entry, idx) => (
                  <tr
                    key={`${user.name}-${idx}`}
                    style={{
                      borderBottom: "1px solid #ddd",
                      backgroundColor: entry.remainingAmount === 0 ? "#d0f0c0" : "white", // green if fully paid
                    }}
                  >
                    <td style={{ padding: "10px 8px", border: "1px solid #ddd" }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: "10px 8px", border: "1px solid #ddd" }}>
                      {user.name}
                    </td>
                    <td style={{ padding: "10px 8px", border: "1px solid #ddd" }}>
                      {entry.partyTo}
                    </td>
                    <td
                      style={{
                        padding: "10px 8px",
                        border: "1px solid #ddd",
                        color: entry.remainingAmount === 0 ? "#2e7d32" : "#d32f2f",
                        fontWeight: 600,
                      }}
                    >
                      {entry.remainingAmount}
                    </td>
                    <td style={{ padding: "10px 8px", border: "1px solid #ddd" }}>
                      {entry.total}
                    </td>
                    <td style={{ padding: "10px 8px", border: "1px solid #ddd" }}>
                      {entry.date}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Paper>
      ) : (
        <Typography align="center" sx={{ mt: 2 }}>
          No payments found.
        </Typography>
      )}
    </Box>
  );
}
