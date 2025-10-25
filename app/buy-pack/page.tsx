"use client";

import { Container, Stack } from "@mui/material";
import { BuyTeam } from "components/BuyTeam";
import { BaseAccountWidget } from "components/BaseAccount";

export default function BuyPackPage() {
  return (
    <Container
      sx={{ marginTop: (theme) => theme.spacing(20), overflow: "hidden" }}
      maxWidth={false}
    >
      <Stack spacing={8}>
        <BuyTeam />
        <BaseAccountWidget />
      </Stack>
    </Container>
  );
}
