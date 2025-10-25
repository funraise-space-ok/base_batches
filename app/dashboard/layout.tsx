import { Container } from "@mui/material";
import { BuyPacksAlert } from "components/BuyPacksAlert";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Container sx={{ mt: 20 }}>
      <BuyPacksAlert />
      {children}
    </Container>
  );
}
