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
import Header from "./Header"; 

const drawerWidth = 240;

export default function Layout({ children }) {
  const [open, setOpen] = useState(true);
  const location = useLocation(); 

  const menuItems = [
    { text: "Add User Work", path: "/user_work" },
    { text: "User Wise Find Reports", path: "/reports" },
    { text: "Days Wise Find Reports", path: "/days_data" },
    { text: "Jama Kharch", path: "/pending_payment" },
    {text: "Sunday Report", path: "/sunday_report"},
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
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
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#f5f5f5", 
            color: "#333", 
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
                    location.pathname === item.path ? "#e0e0e0" : "transparent", 
                  "&:hover": {
                    backgroundColor: "#d5d5d5",
                  },
                }}
              >
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: 16,
                    fontWeight: location.pathname === item.path ? "bold" : "normal",
                    color: "#333", 
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: "background.default", p: 3 }}
      >
        <Toolbar /> 
        {children}
      </Box>
    </Box>
  );
}
