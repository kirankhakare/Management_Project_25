import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemText,
  CssBaseline,
  Box,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import Header from "./Header"; // Import your Header component

const drawerWidth = 240;

export default function Layout({ children }) {
  const [open, setOpen] = useState(true);
  const location = useLocation(); // To highlight active menu

  const menuItems = [
    { text: "Add User Work", path: "/user_work" },
    { text: "Overall Sunday Reports", path: "/reports" },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* AppBar with scrolling header */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "#1976d2",
        }}
      >
        <Toolbar sx={{ minHeight: 80, padding: 0 }}>
          <Header />
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#f5f5f5", // Light background
            color: "#333", // Dark text
            paddingTop: 2,
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {menuItems.map((item, index) => (
              <ListItem
                key={index}
                button
                component={Link}
                to={item.path}
                sx={{
                  mb: 1,
                  borderRadius: 1,
                  px: 3,
                  fontSize: "1rem",
                  backgroundColor:
                    location.pathname === item.path ? "#e0e0e0" : "transparent", // active highlight
                  "&:hover": {
                    backgroundColor: "#d5d5d5", // hover effect
                  },
                }}
              >
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: 16,
                    fontWeight: location.pathname === item.path ? "bold" : "normal",
                    color: "#333", // text color
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main content area */}
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: "background.default", p: 3 }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        {children}
      </Box>
    </Box>
  );
}
