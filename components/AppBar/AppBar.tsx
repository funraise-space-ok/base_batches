"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import MuiAppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import Sitemark from "../SitemarkIcon";
import { StyledToolbar } from "./AppBar.styled";
import { AppBarDrawer } from "./AppBarDrawer";
import { Wallet } from "../Wallet";
import { Stack } from "@mui/material";
import { useIsMobile } from "../../lib/hooks/useIsMobile";

export default function AppBar() {
  const isMobile = useIsMobile();

  return (
    <MuiAppBar
      position="absolute"
      enableColorOnDark
      sx={{
        boxShadow: 0,
        bgcolor: "transparent",
        backgroundImage: "none",
        mt: "calc(var(--template-frame-height, 0px) + 28px)",
      }}
    >
      <Container maxWidth="lg">
        <StyledToolbar variant="dense" disableGutters sx={{ p: 1 }}>
          <Stack
            direction="row"
            gap={2}
            alignItems="center"
            justifyContent="flex-start"
          >
            <Sitemark />
          </Stack>
          {isMobile ? (
            <Box sx={{ display: { xs: "flex", md: "none" }, gap: 1 }}>
              <AppBarDrawer />
            </Box>
          ) : (
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                gap: 1,
                alignItems: "center",
              }}
            >
              <Wallet />
            </Box>
          )}
        </StyledToolbar>
      </Container>
    </MuiAppBar>
  );
}
