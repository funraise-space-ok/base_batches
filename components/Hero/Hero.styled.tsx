"use client";

import { styled } from "@mui/material";

export const StyledBox = styled("div")(({ theme }) => ({
  alignSelf: "center",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  flex: 1,
  padding: theme.spacing(4),
  borderRadius: (theme.vars || theme).shape.borderRadius,
  outline: "6px solid",
  outlineColor: "hsla(220, 25%, 80%, 0.2)",
  border: "1px solid",
  borderColor: (theme.vars || theme).palette.grey[200],
  boxShadow: "0 0 12px 8px hsla(220, 25%, 80%, 0.2)",
  ...theme.applyStyles("dark", {
    boxShadow: "0 0 24px 12px hsla(210, 100%, 25%, 0.2)",
    outlineColor: "hsla(220, 20%, 42%, 0.1)",
    borderColor: (theme.vars || theme).palette.grey[700],
  }),
  minHeight: 500,
  transition: "all 500ms ease-in-out",
  "&:hover": {
    transform: "scale(1.05)",
  },
}));
