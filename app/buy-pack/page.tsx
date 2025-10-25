"use client";

import dynamic from "next/dynamic";
import { Container, Stack } from "@mui/material";
import { BuyTeam } from "components/BuyTeam";

const BaseAccountWidget = dynamic(
  () =>
    import("components/BaseAccount").then((mod) => mod.BaseAccountWidget),
  { ssr: false },
);

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
