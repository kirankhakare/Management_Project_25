import { useState, useEffect } from "react";
import { Box, TextField, Button, Typography, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar, Alert } from "@mui/material";
import { Select, MenuItem, InputLabel } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import axios from "axios";

export default function UserWorkWeekTable() {
  const [weekEntries, setWeekEntries] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [showForm, setShowForm] = useState(false); // form toggle
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [formData, setFormData] = useState({
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
    paymentMode: "",
    vehicleNo: "K101",
  });

  const showMessage = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    const fetchWeekEntries = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/userWork/weekEntriesDayWise");
        setWeekEntries(res.data);
      } catch (err) {
        console.error(err);
        showMessage("Failed to load data", "error");
      }
    };
    fetchWeekEntries();
  }, []);

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
  const handleSelectEntry = (entry) => {
    setFormData({
      name: entry.name,
      sqft: entry.sqft,
      item: entry.item,
      from: entry.from,
      partyTo: entry.partyTo,
      malPlus: entry.malPlus,
      kating: entry.kating,
      total: entry.total,
      date: entry.date,
      paymentStatus: entry.paymentStatus,
      paidAmount: entry.paidAmount,
      paymentMode: entry.paymentMode,
    });
    setShowForm(true);
    const formElement = document.getElementById("workForm");
    if (formElement) formElement.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/userWork", { ...formData, addUser: false });

      if (res.data.isNewUser) {
        const confirmAdd = window.confirm("हा नवीन user आहे. Add करायचाय का?");
        if (!confirmAdd) return;
        await axios.post("http://localhost:5000/api/userWork", { ...formData, addUser: true });
        showMessage("New user added and work saved!", "success");
      } else {
        showMessage("Work saved successfully!", "success");
      }

      // Refresh week entries
      const weekRes = await axios.get("http://localhost:5000/api/userWork/weekEntriesDayWise");
      setWeekEntries(weekRes.data);

      // Reset form & hide
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
        paymentMode: "",
        vehicleNo: "",
      });
      setUserOptions([]);
      setShowForm(false);
    } catch (err) {
      console.error(err.response?.data || err.message);
      showMessage("Failed to save work", "error");
    }
  };

  const getDayName = (dateStr) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[new Date(dateStr).getDay()];
  }

  return (
    <Box sx={{ maxWidth: "95%", mx: "auto", mt: 5 }}>
      <Typography variant="h5" gutterBottom>Week Entries</Typography>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button variant="contained" color="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Close Form" : "Add Work"}
        </Button>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Form */}
      {showForm && (
        <Box id="workForm" sx={{ mb: 4, p: 2, border: "1px solid #ccc", borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <Autocomplete
                freeSolo
                options={userOptions}
                value={formData.name}
                onInputChange={handleNameChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Party Name"
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      style: { minWidth: '240px' } // ← size 
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={2}><TextField label="Sq. Ft." name="sqft" value={formData.sqft} onChange={handleChange} fullWidth /></Grid>

            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <Select
                  value={formData.item}
                  onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                  displayEmpty
                >
                  <MenuItem value="" disabled>Select Item</MenuItem>
                  <MenuItem value="Reti">Reti</MenuItem>
                  <MenuItem value="1/4">1/4</MenuItem>
                  <MenuItem value="Crush">Crush</MenuItem>
                  <MenuItem value="Malma">Malma</MenuItem>
                  <MenuItem value="Gitti">Gitti</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}><TextField label="From" name="from" value={formData.from} onChange={handleChange} fullWidth /></Grid>
            <Grid item xs={12} sm={2}><TextField label="Address" name="partyTo" value={formData.partyTo} onChange={handleChange} fullWidth /></Grid>
            <Grid item xs={12} sm={1}><TextField label="Mal+" name="malPlus" value={formData.malPlus} onChange={handleChange} fullWidth /></Grid>
            <Grid item xs={12} sm={1}><TextField label="Kating" name="kating" value={formData.kating} onChange={handleChange} fullWidth /></Grid>
            <Grid item xs={12} sm={2}><TextField label="Total" name="total" value={formData.total} InputProps={{ readOnly: true }} fullWidth /></Grid>
            <Grid item xs={12} sm={2}><TextField type="date" name="date" value={formData.date} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth /></Grid>

            <Grid item xs={12} sm={2}>
              <FormControl fullWidth sx={{ minWidth: 120 }}> {/* ← custom width */}
                <InputLabel id="vehicle-label">Gadi Number</InputLabel>
                <Select
                  labelId="vehicle-label"
                  value={formData.vehicleNo}
                  onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value })}
                  sx={{ minWidth: 150 }}
                >
                  <MenuItem value=""><em>Select</em></MenuItem>
                  <MenuItem value="K101">K101</MenuItem>
                  <MenuItem value="K102">K102</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Payment Status</FormLabel>
                <RadioGroup row name="paymentStatus" value={formData.paymentStatus} onChange={handleChange}>
                  <FormControlLabel value="Paid" control={<Radio />} label="Paid" />
                  <FormControlLabel value="Unpaid" control={<Radio />} label="Unpaid" />
                </RadioGroup>
              </FormControl>
            </Grid>

            {formData.paymentStatus === "Paid" && (
              <Grid item xs={12} sm={2}><TextField label="Paid Amount" name="paidAmount" value={formData.paidAmount} onChange={handleChange} fullWidth /></Grid>
            )}

            {formData.paymentStatus === "Paid" && (
              <Grid item xs={12} sm={3}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Payment Mode</FormLabel>
                  <RadioGroup row name="paymentMode" value={formData.paymentMode} onChange={handleChange}>
                    <FormControlLabel value="Cash" control={<Radio />} label="Cash" />
                    <FormControlLabel value="Online" control={<Radio />} label="Online" />
                  </RadioGroup>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12} sm={2}>
              <Button variant="contained" color="primary" onClick={handleSubmit} fullWidth>Save Work</Button>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Day-wise Tables */}
      {weekEntries
        .filter(dayEntry => dayEntry.entries && dayEntry.entries.length > 0)
        .sort((a, b) => {
          const weekdayA = new Date(a.date).getDay() === 0 ? 7 : new Date(a.date).getDay();
          const weekdayB = new Date(b.date).getDay() === 0 ? 7 : new Date(b.date).getDay();
          return weekdayA - weekdayB;
        })
        .map((dayEntry, index) => {
          const sortedEntries = [...dayEntry.entries].sort((a, b) => a.vehicleNo.localeCompare(b.vehicleNo));
          return (
            <Box key={index} sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 1,
                  color: "#1565c0",
                  fontWeight: "bold",
                  borderBottom: "2px solid #1565c0",
                  display: "inline-block",
                  pb: 0.5,
                }}
              >
                {getDayName(dayEntry.date)} - {dayEntry.date}
              </Typography>

              <TableContainer
                component={Paper}
                sx={{
                  boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#1976d2" }}>
                      {[
                        "Sr No",
                        "User Name",
                        "Sq. Ft.",
                        "Item",
                        "From",
                        "Party To",
                        "Mal+",
                        "Kating",
                        "Total",
                        "Payment Status",
                        "Paid Amount",
                        "Payment Mode",
                        "Gadi Number",
                      ].map((header, i) => (
                        <TableCell
                          key={i}
                          sx={{
                            color: "white",
                            fontWeight: "bold",
                            textAlign: "center",
                          }}
                        >
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {sortedEntries.map((entry, i) => {
                      const isFullyPaid =
                        parseFloat(entry.paidAmount) === parseFloat(entry.total);

                      return (
                        <TableRow
                          key={i}
                          sx={{
                            backgroundColor: i % 2 === 0 ? "#f9f9f9" : "#ffffff",
                            "&:hover": {
                              backgroundColor: "#e3f2fd",
                              transition: "0.3s",
                            },
                            ...(isFullyPaid && {
                              backgroundColor: "#c8e6c9",
                            }),
                          }}
                        >
                          <TableCell sx={{ textAlign: "center", fontWeight: 500 }}>
                            {i + 1}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>{entry.name}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{entry.sqft}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{entry.item}</TableCell>
                          <TableCell>{entry.from}</TableCell>
                          <TableCell>{entry.partyTo}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{entry.malPlus}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{entry.kating}</TableCell>
                          <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
                            ₹{entry.total}
                          </TableCell>
                          <TableCell
                            sx={{
                              color:
                                entry.paymentStatus === "Paid"
                                  ? "green"
                                  : "red",
                              fontWeight: "bold",
                              textAlign: "center",
                            }}
                          >
                            {entry.paymentStatus}
                          </TableCell>
                          <TableCell sx={{ textAlign: "center" }}>
                            {entry.paidAmount || "-"}
                          </TableCell>
                          <TableCell sx={{ textAlign: "center" }}>
                            {entry.paymentStatus === "Paid"
                              ? entry.paymentMode
                              : "--"}
                          </TableCell>
                          <TableCell sx={{ textAlign: "center" }}>
                            {entry.vehicleNo || "-"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )
        })}
    </Box>
  );
}
