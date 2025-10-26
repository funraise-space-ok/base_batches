import { Box } from "@mui/material";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Box sx={{ mt: 12 }}>
      {children}
    </Box>
  );
}
