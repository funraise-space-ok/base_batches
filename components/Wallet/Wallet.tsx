"use client";

import { Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useConnect, useDisconnect, useAccount } from "wagmi";

export function Wallet() {
  const { address, isConnecting, isConnected } = useAccount();
  const { connect, connectors, isPending, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();

  const firstConnector = connectors[0];

  const shortAddress =
    address && `${address.slice(0, 4)}...${address.slice(address.length - 4)}`;

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {!isConnected ? (
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => firstConnector && connect({ connector: firstConnector })}
          disabled={!firstConnector || isPending || isConnecting}
          sx={{ minWidth: 140 }}
        >
          {isPending || isConnecting ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            "Connect Wallet"
          )}
        </Button>
      ) : (
        <>
          <Typography variant="body2" sx={{ color: "white", fontSize: "0.875rem" }}>
            {shortAddress}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => disconnect()}
            sx={{
              color: "white",
              borderColor: "white",
              "&:hover": {
                borderColor: "rgba(255, 255, 255, 0.7)",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            Disconnect
          </Button>
        </>
      )}
      {connectError ? (
        <Typography
          variant="caption"
          sx={{ color: "error.main", display: { xs: "none", md: "block" } }}
        >
          {connectError.shortMessage ?? connectError.message}
        </Typography>
      ) : null}
    </Stack>
  );
}
