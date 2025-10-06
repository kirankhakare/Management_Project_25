import { useState, useEffect } from "react";
import { Box, Typography, Paper, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import axios from "axios";

export default function AllUsersGadiReport() {
  const [gadiNo, setGadiNo] = useState("All");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/userWork/allByGadiNo", {
        params: { vehicleNo: gadiNo },
      });
      setEntries(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch data");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [gadiNo]);

  return (
    <Box sx={{ width: "100%", mt: 5, px: 2 }}>
      <Typography variant="h4" gutterBottom align="center">
        All Users Entries by Gadi No
      </Typography>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Select Gadi No</InputLabel>
        <Select value={gadiNo} onChange={(e) => setGadiNo(e.target.value)} label="Select Gadi No">
          <MenuItem value="All">All</MenuItem>
          <MenuItem value="K101">K101</MenuItem>
          <MenuItem value="K102">K102</MenuItem>
        </Select>
      </FormControl>

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
                <th style={{ padding: "12px", border: "1px solid #1976d2" }}>Sr. No</th>
                <th style={{ padding: "12px", border: "1px solid #1976d2" }}>User Name</th>
                <th style={{ padding: "12px", border: "1px solid #1976d2" }}>From</th>
                <th style={{ padding: "12px", border: "1px solid #1976d2" }}>Party To</th>
                <th style={{ padding: "12px", border: "1px solid #1976d2" }}>Vehicle No</th>
                <th style={{ padding: "12px", border: "1px solid #1976d2" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{i + 1}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{e.name}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{e.from}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{e.partyTo}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{e.vehicleNo}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {new Date(e.date).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Paper>
      ) : (
        <Typography align="center">No entries found.</Typography>
      )}
    </Box>
  );
}
