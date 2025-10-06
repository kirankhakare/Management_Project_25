import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

export default function DayWiseTable({ weekEntries, getDayName }) {
  if (!weekEntries || weekEntries.length === 0) return null;

  return (
    <>
      {weekEntries
        .filter((dayEntry) => dayEntry.entries && dayEntry.entries.length > 0)
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
                        "Party Name",
                        "Sq. Ft.",
                        "Item",
                        "From",
                        "Address",
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
                            backgroundColor: isFullyPaid
                              ? "#c8e6c9"
                              : i % 2 === 0
                              ? "#f9f9f9"
                              : "#ffffff",
                            "&:hover": {
                              backgroundColor: "#e3f2fd",
                              transition: "0.3s",
                            },
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
                              color: entry.paymentStatus === "Paid" ? "green" : "red",
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
                            {entry.paymentStatus === "Paid" ? entry.paymentMode : "--"}
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
          );
        })}
    </>
  );
}
