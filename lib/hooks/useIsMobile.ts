import { Breakpoint, useMediaQuery } from "@mui/material";

export const useIsMobile = (key: Breakpoint | number = "sm") =>
  useMediaQuery((theme) => theme.breakpoints.down(key));

export const useIsTablet = (key: Breakpoint | number = "md") =>
  useIsMobile(key);
