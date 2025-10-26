"use client";

import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Drawer from "@mui/material/Drawer";
import MenuIcon from "@mui/icons-material/Menu";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useState } from "react";

export function AppBarDrawer() {
  const [open, setOpen] = useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  return (
    <>
      <IconButton aria-label="Menu button" onClick={toggleDrawer(true)}>
        <MenuIcon />
      </IconButton>
      <Drawer
        anchor="top"
        open={open}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            top: "var(--template-frame-height, 0px)",
          },
        }}
      >
        <Box sx={{ p: 2, backgroundColor: "background.default" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <IconButton onClick={toggleDrawer(false)}>
              <CloseRoundedIcon />
            </IconButton>
          </Box>

          <MenuItem>Features</MenuItem>
          <MenuItem>Testimonials</MenuItem>
          <MenuItem>Highlights</MenuItem>
          <MenuItem>Pricing</MenuItem>
          <MenuItem>FAQ</MenuItem>
          <MenuItem>Blog</MenuItem>
          <Divider sx={{ my: 3 }} />
          <MenuItem>
            <Button color="primary" variant="contained" fullWidth>
              Sign up
            </Button>
          </MenuItem>
          <MenuItem>
            <Button color="primary" variant="outlined" fullWidth>
              Sign in
            </Button>
          </MenuItem>
        </Box>
      </Drawer>
    </>
  );
}
