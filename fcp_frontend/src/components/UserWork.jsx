import { useState } from "react";
import { Box, TextField, Button, Typography, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Grid } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import axios from "axios";

export default function UserWorkForm() {
  const [userOptions, setUserOptions] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    sqft: "",
    from: "",
    malPlus: "",
    kating: "",
    total: 0,
    date: "",
    paymentStatus: "Unpaid",
    paidAmount: "",
  });

  // 🔹 Handle input change for all fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    updated.total = (parseFloat(updated.malPlus) || 0) + (parseFloat(updated.kating) || 0);
    setFormData(updated);
  };

  // 🔹 Autocomplete search as user types
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

  // 🔹 Submit work
  const handleSubmit = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/userWork", { ...formData, addUser: false });

      if (res.data.isNewUser) {
        const confirmAdd = window.confirm("हा नवीन user आहे. Add करायचाय का?");
        if (!confirmAdd) return;

        await axios.post("http://localhost:5000/api/userWork", { ...formData, addUser: true });
        alert("✅ New user added and work saved!");
      } else {
        alert("✅ Work saved successfully!");
      }

      // Reset form
      setFormData({
        name: "",
        sqft: "",
        from: "",
        malPlus: "",
        kating: "",
        total: 0,
        date: "",
        paymentStatus: "Unpaid",
        paidAmount: "",
      });

      setUserOptions([]);
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("❌ Failed to save work");
    }
  };

  return (
    <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
      <Box sx={{ maxWidth: 600, mx: "auto", mt: 5 }}>
        <Typography variant="h5" gutterBottom>Add User Work</Typography>

        <Autocomplete
          freeSolo
          options={userOptions}
          value={formData.name}
          onInputChange={handleNameChange}
          renderInput={(params) => (
            <TextField {...params} label="User Name" fullWidth sx={{ mb: 2 }} />
          )}
        />

        <TextField label="Sq. Ft." name="sqft" value={formData.sqft} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
        <TextField label="From" name="from" value={formData.from} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
        <TextField label="Mal+" name="malPlus" value={formData.malPlus} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
        <TextField label="Kating" name="kating" value={formData.kating} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
        <TextField label="Total Amount" name="total" value={formData.total} InputProps={{ readOnly: true }} fullWidth sx={{ mb: 2 }} />
        <TextField type="date" name="date" value={formData.date} onChange={handleChange} fullWidth sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />

        <FormControl component="fieldset" sx={{ mb: 2 }}>
          <FormLabel component="legend">Payment Status</FormLabel>
          <RadioGroup row name="paymentStatus" value={formData.paymentStatus} onChange={handleChange}>
            <FormControlLabel value="Paid" control={<Radio />} label="Paid" />
            <FormControlLabel value="Unpaid" control={<Radio />} label="Unpaid" />
          </RadioGroup>
        </FormControl>

        {formData.paymentStatus === "Paid" && (
          <TextField label="Paid Amount" name="paidAmount" value={formData.paidAmount} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
        )}

        <Button variant="contained" color="primary" onClick={handleSubmit}>Save Work</Button>
      </Box>
    </Grid>
  );
}
