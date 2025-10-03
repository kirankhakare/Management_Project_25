import { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Paper, Autocomplete } from "@mui/material";
import axios from "axios";

export default function PendingPayments() {
  const [userOptions, setUserOptions] = useState([]);
  const [partyOptions, setPartyOptions] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedParty, setSelectedParty] = useState("");
  const [pendingEntries, setPendingEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [payAmounts, setPayAmounts] = useState({});
  const [paymentDates, setPaymentDates] = useState({});

  // Fetch user suggestions
  const fetchUserSuggestions = async (name) => {
    if (!name) return setUserOptions([]);
    try {
      const res = await axios.get("http://localhost:5000/api/userWork/search", { params: { name } });
      setUserOptions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch pending entries
  const fetchPending = async () => {
    if (!selectedUser) return;
    try {
      const res = await axios.get("http://localhost:5000/api/userWork/pending", {
        params: { name: selectedUser, start: "2000-01-01", end: "2100-01-01" },
      });

      // Only pending entries (remainingAmount > 0)
      const pending = res.data.filter(e => e.remainingAmount > 0);

      setPendingEntries(pending);

      // Extract unique party names
      const parties = [...new Set(pending.map(e => e.partyTo || ""))];
      setPartyOptions(parties);

      // Reset payAmounts and paymentDates
      const amounts = {};
      const dates = {};
      pending.forEach(e => {
        amounts[e.id] = e.remainingAmount; // default pay full remaining
        dates[e.id] = new Date().toISOString().split("T")[0]; // default today
      });
      setPayAmounts(amounts);
      setPaymentDates(dates);

      // Apply party filter
      if (selectedParty) {
        setFilteredEntries(pending.filter(e => e.partyTo === selectedParty));
      } else {
        setFilteredEntries(pending);
      }

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPending();
  }, [selectedUser]);

  // Filter entries by Party To
  useEffect(() => {
    if (!selectedParty) setFilteredEntries(pendingEntries);
    else setFilteredEntries(pendingEntries.filter(e => e.partyTo === selectedParty));
  }, [selectedParty, pendingEntries]);

  const handlePay = async (entryId) => {
    const amount = parseFloat(payAmounts[entryId]);
    if (!amount || amount <= 0) return alert("Enter valid amount");

    try {
      await axios.post("http://localhost:5000/api/userWork/pay", {
        entryId,
        amount,
        date: paymentDates[entryId], // optional if you want to save payment date
      });
      alert("Payment successful!");
      fetchPending(); // refresh table
    } catch (err) {
      console.error(err);
      alert("Payment failed");
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 5, p: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        Pending Payments
      </Typography>

      {/* User Autocomplete */}
      <Autocomplete
        freeSolo
        options={userOptions}
        value={selectedUser}
        onInputChange={(e, val) => {
          setSelectedUser(val);
          fetchUserSuggestions(val);
        }}
        renderInput={(params) => <TextField {...params} label="User Name" fullWidth sx={{ mb: 2 }} />}
      />

      {/* Party Autocomplete */}
      <Autocomplete
        freeSolo
        options={partyOptions}
        value={selectedParty}
        onChange={(e, val) => setSelectedParty(val)}
        renderInput={(params) => <TextField {...params} label="Party To" fullWidth sx={{ mb: 2 }} />}
      />

      <Button variant="contained" color="primary" fullWidth sx={{ mb: 3 }} onClick={fetchPending}>
        Show Pending
      </Button>

      {filteredEntries.length > 0 && (
        <Paper sx={{ p: 3, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center", fontSize: "14px" }}>
            <thead>
              <tr style={{ backgroundColor: "#1976d2", color: "white" }}>
                <th>User Name</th>
                <th>Party To</th>
                <th>Date</th>
                <th>Remaining Amount</th>
                <th>Pay Amount</th>
                <th>Payment Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((e) => (
                <tr key={e.id}>
                  <td>{e.name}</td>
                  <td>{e.partyTo || "-"}</td>
                  <td>{new Date(e.date).toLocaleDateString("en-GB")}</td>
                  <td style={{ color: e.remainingAmount > 0 ? "#d32f2f" : "#2e7d32" }}>{e.remainingAmount}</td>

                  {/* Pay Amount Input */}
                  <td>
                    <TextField
                      type="number"
                      value={payAmounts[e.id]}
                      onChange={(ev) => setPayAmounts({ ...payAmounts, [e.id]: ev.target.value })}
                      size="small"
                      inputProps={{ min: 0, max: e.remainingAmount }}
                    />
                  </td>

                  {/* Payment Date Input */}
                  <td>
                    <TextField
                      type="date"
                      value={paymentDates[e.id]}
                      onChange={(ev) => setPaymentDates({ ...paymentDates, [e.id]: ev.target.value })}
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                  </td>

                  {/* Pay Button */}
                  <td>
                    <Button variant="contained" color="secondary" onClick={() => handlePay(e.id)}>
                      Pay
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Paper>
      )}
    </Box>
  );
}
