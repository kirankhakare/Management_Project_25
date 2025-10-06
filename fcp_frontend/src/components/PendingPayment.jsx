import { useState } from "react";
import { Box, Typography, TextField, Button, Paper, Autocomplete } from "@mui/material";
import axios from "axios";
import AllPendingPayments from "../components/AllPendingPayments";

export default function PendingPaymentsTotal() {
  const [selectedUser, setSelectedUser] = useState("");
  const [userOptions, setUserOptions] = useState([]); 
  const [pendingEntries, setPendingEntries] = useState([]);
  const [totalPay, setTotalPay] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [showBox, setShowBox] = useState(false);
  const handleUserSearch = async (event, newValue) => {
    setSelectedUser(newValue);
    if (newValue && newValue.length >= 1) {
      try {
        const res = await axios.get(`http://localhost:5000/api/userWork/search?name=${newValue}`);
        setUserOptions(res.data); // res.data should be an array of names
      } catch (err) {
        console.error(err);
        setUserOptions([]);
      }
    } else {
      setUserOptions([]);
    }
  };

  const fetchPending = async () => {
    if (!selectedUser) return alert("Enter party name");
    try {
      const res = await axios.get("http://localhost:5000/api/userWork/pending", {
        params: { name: selectedUser },
      });
      setPendingEntries(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch pending entries");
    }
  };

  const totalRemaining = pendingEntries.reduce((sum, e) => sum + e.remainingAmount, 0);

  const handleTotalPay = async () => {
    let payAmount = parseFloat(totalPay);
    if (!payAmount || payAmount <= 0) return alert("Enter valid payment amount");
    if (payAmount > totalRemaining) return alert("Payment exceeds total remaining");

    const updatedEntries = [...pendingEntries];
    try {
      for (let entry of updatedEntries) {
        if (payAmount <= 0) break;
        const payForEntry = Math.min(payAmount, entry.remainingAmount);

        await axios.post("http://localhost:5000/api/userWork/pay", {
          entryId: entry.id,
          amount: payForEntry,
          date: paymentDate,
        });

        entry.remainingAmount -= payForEntry;
        payAmount -= payForEntry;
      }

      alert("Payment applied successfully!");
      setTotalPay("");
      fetchPending();
    } catch (err) {
      console.error(err);
      alert("Payment failed");
    }
  };

  return (
    <Box sx={{ maxWidth: "100%", mx: "auto", mt: 5, px: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowBox(!showBox)}
        >
          {showBox ? "Close Pending Payments" : "Open Pending Payments"}
        </Button>
      </Box>

      {showBox && (
        <Paper sx={{ p: 3, mb: 3, overflowX: "auto" }}>
          <Autocomplete
            freeSolo
            options={userOptions}
            value={selectedUser}
            onInputChange={handleUserSearch}
            renderInput={(params) => <TextField {...params} label="Party Name" fullWidth sx={{ mb: 2 }} />}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mb: 3 }}
            onClick={fetchPending}
          >
            Show Pending
          </Button>
          {pendingEntries.length > 0 && (
            <>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "center",
                  minWidth: 400,
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#1976d2", color: "white" }}>
                    <th style={{ padding: "12px 8px", border: "1px solid #1976d2" }}>Party Name</th>
                    <th style={{ padding: "12px 8px", border: "1px solid #1976d2" }}>Address</th>
                    <th style={{ padding: "12px 8px", border: "1px solid #1976d2" }}>Date</th>
                    <th style={{ padding: "12px 8px", border: "1px solid #1976d2" }}>Remaining Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingEntries.map((e, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #ddd" }}>
                      <td style={{ padding: "10px 8px", border: "1px solid #ddd" }}>{e.name}</td>
                      <td style={{ padding: "10px 8px", border: "1px solid #ddd" }}>{e.partyTo}</td>
                      <td style={{ padding: "10px 8px", border: "1px solid #ddd" }}>
                        {new Date(e.date).toLocaleDateString("en-GB")}
                      </td>
                      <td
                        style={{
                          padding: "10px 8px",
                          border: "1px solid #ddd",
                          color: e.remainingAmount > 0 ? "#d32f2f" : "#2e7d32",
                          fontWeight: 600,
                        }}
                      >
                        {e.remainingAmount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Box sx={{ display: "flex", alignItems: "center", mt: 2, gap: 2, flexWrap: "wrap" }}>
                <Typography variant="subtitle1">Total Remaining: {totalRemaining}</Typography>
                <TextField
                  label="Pay Amount"
                  type="number"
                  value={totalPay}
                  onChange={(e) => setTotalPay(e.target.value)}
                  size="small"
                />
                <TextField
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
                <Button variant="contained" color="secondary" onClick={handleTotalPay}>
                  Pay
                </Button>
              </Box>
            </>
          )}
        </Paper>
      )}
      <Box sx={{ mt: 4 }}>
        <AllPendingPayments />
      </Box>
    </Box>
  );
}
