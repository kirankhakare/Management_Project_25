import React from "react";
import { Box, Typography } from "@mui/material";

export default function Header() {
  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "#0D47A1", 
        color: "#FFD700",
        height: 80, 
        overflow: "hidden",
        position: "relative",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          display: "inline-block",
          whiteSpace: "nowrap",
          position: "absolute",
          animation: "marquee 25s linear infinite", // Slower movement
        }}
      >
        <Typography
          variant="h4"
          component="span"
          sx={{ fontWeight: "bold", letterSpacing: 1 }}
        >
          Welcome to Construction Site...
        </Typography>
      </Box>
      
      <style>
        {`
          @keyframes marquee {
            0% { left: 100%; }
            100% { left: -100%; }
          }
        `}
      </style>
    </Box>
  );
}
