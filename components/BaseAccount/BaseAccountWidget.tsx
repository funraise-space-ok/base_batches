"use client";

import { useMemo, useState } from "react";
import {
  createBaseAccountSDK,
  getPaymentStatus,
  pay,
  type BaseAccountSDK,
} from "@base-org/account";
import {
  BasePayButton,
  SignInWithBaseButton,
} from "@base-org/account-ui/react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

const defaultLogo =
  "https://raw.githubusercontent.com/base-org/brand-kit/main/logo/base-logo-primary.png";
const payRecipient =
  (process.env.NEXT_PUBLIC_BASE_PAY_RECIPIENT as `0x${string}` | undefined) ??
  "0xRecipientAddress";
const payAmount = process.env.NEXT_PUBLIC_BASE_PAY_AMOUNT ?? "0.01";
const payTestnet =
  (process.env.NEXT_PUBLIC_BASE_PAY_TESTNET ?? "true").toLowerCase() !== "false";
const appName =
  process.env.NEXT_PUBLIC_BASE_PAY_APP_NAME ?? "Base Batches Quickstart";
const appLogoUrl = process.env.NEXT_PUBLIC_BASE_PAY_LOGO_URL ?? defaultLogo;

export function BaseAccountWidget() {
  const theme = useTheme();
  const [sdk] = useState<BaseAccountSDK>(() =>
    createBaseAccountSDK({
      appName,
      appLogoUrl,
    }),
  );
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const colorScheme = theme.palette.mode === "dark" ? "dark" : "light";
  const isRecipientConfigured = useMemo(
    () => payRecipient !== "0xRecipientAddress",
    [],
  );

  const handleSignIn = async () => {
    try {
      setSignInError(null);
      await sdk.getProvider().request({ method: "wallet_connect" });
      setIsSignedIn(true);
    } catch (error) {
      console.error("Sign in failed:", error);
      setSignInError("No se pudo iniciar sesión con Base Account.");
    }
  };

  const handlePayment = async () => {
    setPaymentStatus(null);
    try {
      const { id } = await pay({
        amount: payAmount,
        to: payRecipient,
        testnet: payTestnet,
      });
      setPaymentId(id);
      setPaymentStatus(
        "Pago iniciado. Usa el botón para verificar el estado en la blockchain.",
      );
    } catch (error) {
      console.error("Payment failed:", error);
      setPaymentStatus("El pago falló. Inténtalo nuevamente.");
    }
  };

  const handleCheckStatus = async () => {
    if (!paymentId) {
      setPaymentStatus("Necesitas iniciar un pago antes de consultar el estado.");
      return;
    }

    setIsCheckingStatus(true);
    try {
      const { status } = await getPaymentStatus({ id: paymentId });
      setPaymentStatus(`Estado del pago: ${status}`);
    } catch (error) {
      console.error("Status check failed:", error);
      setPaymentStatus("No se pudo consultar el estado. Intenta de nuevo.");
    } finally {
      setIsCheckingStatus(false);
    }
  };

  return (
    <Card
      elevation={12}
      sx={{
        borderRadius: 4,
        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(135deg, #0f172a 0%, #1f2937 100%)"
            : "linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)",
        color: theme.palette.mode === "dark" ? "white" : "inherit",
      }}
    >
      <CardContent sx={{ p: { xs: 4, md: 6 } }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="overline" sx={{ letterSpacing: 2 }}>
              BASE ACCOUNT
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
              Sign in with Base y pagos 1-click
            </Typography>
            <Typography variant="body1" sx={{ mt: 1.5, opacity: 0.8 }}>
              Integramos el SDK oficial para que puedas autenticar usuarios y
              cobrar con Base Pay en segundos. Configura tu dirección de destino
              y comienza a recibir USDC en Base.
            </Typography>
          </Box>

          <Stack spacing={2} alignItems="flex-start">
            <SignInWithBaseButton
              align="center"
              variant="solid"
              colorScheme={colorScheme}
              size="medium"
              onClick={handleSignIn}
            />
            {isSignedIn ? (
              <Typography variant="body2" sx={{ color: "success.light" }}>
                ✅ Sesión iniciada con Base Account
              </Typography>
            ) : null}
            {signInError ? (
              <Alert severity="error" onClose={() => setSignInError(null)}>
                {signInError}
              </Alert>
            ) : null}
          </Stack>

          <Stack spacing={2} alignItems="flex-start">
            <BasePayButton colorScheme={colorScheme} onClick={handlePayment} />
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              Monto: {payAmount} USD · Red: {payTestnet ? "Base Sepolia" : "Base"}
            </Typography>
            <Button
              variant="outlined"
              onClick={handleCheckStatus}
              disabled={isCheckingStatus || !paymentId}
            >
              {isCheckingStatus ? "Consultando..." : "Consultar estado del pago"}
            </Button>
          </Stack>

          {paymentStatus ? (
            <Alert
              severity={paymentStatus.includes("fall") ? "error" : "info"}
              onClose={() => setPaymentStatus(null)}
            >
              {paymentStatus}
            </Alert>
          ) : null}

          {!isRecipientConfigured ? (
            <Alert severity="warning">
              Actualiza <code>NEXT_PUBLIC_BASE_PAY_RECIPIENT</code> en tu archivo
              de entorno para enviar fondos a tu dirección real.
            </Alert>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
