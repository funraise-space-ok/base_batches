import { CreditCard, Storefront } from "@mui/icons-material";
import { Alert, Button, Stack, Typography } from "@mui/material";
import Link from "next/link";

export function BuyPacksAlert() {
  return (
    <Alert
      variant="outlined"
      icon={false}
      action={
        <Stack direction="row" gap={1}>
          <Link passHref href="/buy-pack">
            <Button 
              startIcon={<CreditCard />}
              sx={{
                background: 'linear-gradient(45deg, #6a1b9a 30%, #8e24aa 90%)',
                color: 'white',
                border: '1px solid rgba(156, 39, 176, 0.5)',
                borderRadius: '8px',
                '&:hover': {
                  background: 'linear-gradient(45deg, #8e24aa 30%, #ab47bc 90%)',
                  boxShadow: '0 4px 20px rgba(156, 39, 176, 0.4)'
                }
              }}
            >
              Buy Packs Now
            </Button>
          </Link>
          <Link passHref href="/marketplace">
            <Button startIcon={<Storefront />}>Explore Marketplace</Button>
          </Link>
        </Stack>
      }
    >
      <Typography variant="overline">
        🚀 Build Your Dream Team & Own the Game! 🚀
      </Typography>
      <Typography variant="subtitle2">
        Unlock exclusive athlete packs and turn real-world victories into
        rewards.
      </Typography>
    </Alert>
  );
}
