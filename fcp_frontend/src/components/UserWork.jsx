import { useState } from "react";
import { Box, TextField, Button, Typography, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import axios from "axios";

export default function UserWorkForm() {
  const [userOptions, setUserOptions] = useState([]);
  const [savedEntries, setSavedEntries] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    sqft: "",
    item: "",
    from: "",
    partyTo: "",
    malPlus: "",
    kating: "",
    total: 0,
    date: new Date().toISOString().split("T")[0], // default current date
    paymentStatus: "Unpaid",
    paidAmount: "",
    paymentMode: "Cash", // default
  });

  // Get current week Monday → Sunday
  const getCurrentWeekRange = () => {
    const curr = new Date();
    const first = curr.getDate() - curr.getDay() + 1; // Monday
    const monday = new Date(curr.setDate(first));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return [monday, sunday];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    updated.total = (parseFloat(updated.malPlus) || 0) + (parseFloat(updated.kating) || 0);
    setFormData(updated);
  };

  const handleNameChange = async (event, newValue) => {
    setFormData({ ...formData, name: newValue });
    if (newValue && newValue.length >= 1) {
      try {
        const res = await axios.get(`http://localhost:5000/api/userWork/search?name=${newValue}`);
        setUserOptions(res.data);
      } catch (err) {
        console.error(err);
      }
    } else {
      setUserOptions([]);
    }
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/userWork", { ...formData, addUser: false });

      if (res.data.isNewUser) {
        const confirmAdd = window.confirm("हा नवीन user आहे. Add करायचाय का?");
        if (!confirmAdd) return;
        await axios.post("http://localhost:5000/api/userWork", { ...formData, addUser: true });
        alert("New user added and work saved!");
      } else {
        alert("Work saved successfully!");
      }

      // Add entry to savedEntries
      setSavedEntries([...savedEntries, { ...formData }]);

      // Reset form
      setFormData({
        name: "",
        sqft: "",
        item: "",
        from: "",
        partyTo: "",
        malPlus: "",
        kating: "",
        total: 0,
        date: new Date().toISOString().split("T")[0],
        paymentStatus: "Unpaid",
        paidAmount: "",
        paymentMode: "Cash",
      });
      setUserOptions([]);
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Failed to save work");
    }
  };

  const [weekStart, weekEnd] = getCurrentWeekRange();

  // Filter entries for current week
  const weekEntries = savedEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= weekStart && entryDate <= weekEnd;
  });

  // Prepare Monday → Sunday sequence but only with dates having actual entry
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    weekDates.push(d.toISOString().split("T")[0]);
  }

  const entriesByDate = {};
  weekEntries.forEach(e => {
    const eDate = new Date(e.date).toISOString().split("T")[0];
    entriesByDate[eDate] = e;
  });

  const orderedWeekEntries = weekDates
    .filter(d => entriesByDate[d]) // only dates with entry
    .map(d => entriesByDate[d]);

  return (
    <Box sx={{ maxWidth: "95%", mx: "auto", mt: 5 }}>
      <Typography variant="h5" gutterBottom>Add User Work</Typography>

      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item>
          <Autocomplete
            freeSolo
            options={userOptions}
            value={formData.name}
            onInputChange={handleNameChange}
            renderInput={(params) => <TextField {...params} label="User Name" />}
          />
        </Grid>
        <Grid item><TextField label="Sq. Ft." name="sqft" value={formData.sqft} onChange={handleChange} /></Grid>
        <Grid item><TextField label="Item" name="item" value={formData.item} onChange={handleChange} /></Grid>
        <Grid item><TextField label="From" name="from" value={formData.from} onChange={handleChange} /></Grid>
        <Grid item><TextField label="Party To" name="partyTo" value={formData.partyTo} onChange={handleChange} /></Grid>
        <Grid item><TextField label="Mal+" name="malPlus" value={formData.malPlus} onChange={handleChange} /></Grid>
        <Grid item><TextField label="Kating" name="kating" value={formData.kating} onChange={handleChange} /></Grid>
        <Grid item><TextField label="Total Amount" name="total" value={formData.total} InputProps={{ readOnly: true }} /></Grid>
        <Grid item><TextField type="date" name="date" value={formData.date} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>

        <Grid item>
          <FormControl component="fieldset">
            <FormLabel component="legend">Payment Status</FormLabel>
            <RadioGroup row name="paymentStatus" value={formData.paymentStatus} onChange={handleChange}>
              <FormControlLabel value="Paid" control={<Radio />} label="Paid" />
              <FormControlLabel value="Unpaid" control={<Radio />} label="Unpaid" />
            </RadioGroup>
          </FormControl>
        </Grid>

        {formData.paymentStatus === "Paid" && (
          <Grid item><TextField label="Paid Amount" name="paidAmount" value={formData.paidAmount} onChange={handleChange} /></Grid>
        )}

        <Grid item>
          <FormControl component="fieldset">
            <FormLabel component="legend">Payment Mode</FormLabel>
            <RadioGroup row name="paymentMode" value={formData.paymentMode} onChange={handleChange}>
              <FormControlLabel value="Cash" control={<Radio />} label="Cash" />
              <FormControlLabel value="Online" control={<Radio />} label="Online" />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid item>
          <Button variant="contained" color="primary" onClick={handleSubmit}>Save Work</Button>
        </Grid>
      </Grid>

      {/* Table to show current week entries only */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>User Name</TableCell>
              <TableCell>Sq. Ft.</TableCell>
              <TableCell>Item</TableCell>
              <TableCell>From</TableCell>
              <TableCell>Party To</TableCell>
              <TableCell>Mal+</TableCell>
              <TableCell>Kating</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Payment Status</TableCell>
              <TableCell>Paid Amount</TableCell>
              <TableCell>Payment Mode</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orderedWeekEntries.map((entry, index) => (
              <TableRow key={index}>
                <TableCell>{entry.date}</TableCell>
                <TableCell>{entry.name}</TableCell>
                <TableCell>{entry.sqft}</TableCell>
                <TableCell>{entry.item}</TableCell>
                <TableCell>{entry.from}</TableCell>
                <TableCell>{entry.partyTo}</TableCell>
                <TableCell>{entry.malPlus}</TableCell>
                <TableCell>{entry.kating}</TableCell>
                <TableCell>{entry.total}</TableCell>
                <TableCell>{entry.paymentStatus}</TableCell>
                <TableCell>{entry.paidAmount}</TableCell>
                <TableCell>{entry.paymentMode}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
