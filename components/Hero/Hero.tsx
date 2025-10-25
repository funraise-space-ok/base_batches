"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { StyledBox } from "./Hero.styled";
import {
  ArrowUpward,
  AttachMoney,
  CardGiftcard,
  CreditCard,
  Lightbulb,
  Money,
  PersonSearch,
  Star,
  StarOutline,
  SwapHoriz,
  TrendingUp,
} from "@mui/icons-material";
import {
  Grid2,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Glow } from "../Glow/Glow";
import { useIsMobile } from "../../lib/hooks/useIsMobile";
import { TOKEN_SYMBOL } from "../../lib/constants";

export default function Hero() {
  const isMobile = useIsMobile();

  return (
    <Box
      id="hero"
      sx={(theme) => ({
        width: "100%",
        backgroundRepeat: "no-repeat",
        backgroundImage:
          "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 90%), transparent)",
        ...theme.applyStyles("dark", {
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 16%), transparent)",
        }),
      })}
    >
      <Container
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          pt: { xs: 14, sm: 14 },
        }}
      >
        <Box pb={isMobile ? 0 : 4} pt={isMobile ? 0 : 1} textAlign="center">
          <Typography
            variant="overline"
            fontWeight={(t) => t.typography.fontWeightBold}
            fontSize={(t) =>
              isMobile
                ? t.typography.caption.fontSize
                : t.typography.body1.fontSize
            }
          >
            🏆 Back Real Athletes. Play for Real Rewards 🏆
          </Typography>
          <Typography>
            Invest in rising stars, get unique teams, and win real rewards based
            on their real-world performance.
          </Typography>
        </Box>
        <Box sx={{ mb: isMobile ? 20 : 25, mt: isMobile ? 3 : 5 }}>
          <Glow>
            <Stack spacing={2} useFlexGap sx={{ alignItems: "center", pt: 5 }}>
              <Typography
                variant="h1"
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "column" },
                  alignItems: "center",
                  fontSize: "clamp(3rem, 10vw, 3.5rem)",
                }}
                textAlign="center"
              >
                <Typography
                  variant="h2"
                  component="span"
                  fontWeight={400}
                  pb={2}
                >
                  Welcome to <strong>funraise sports</strong>
                </Typography>
                <Typography
                  component="span"
                  variant="h2"
                  sx={(theme) => ({
                    fontSize: "inherit",
                    color: "primary.main",
                    ...theme.applyStyles("dark", {
                      color: "primary.light",
                    }),
                  })}
                  textAlign="center"
                >
                  Don’t Just Watch, Own the Game
                </Typography>
              </Typography>
              <Typography variant="subtitle1" maxWidth={800} textAlign="center">
                Transform the way you support your favorite athletes. With
                funraise, you can invest in their careers, collect unique teams,
                and enjoy real earnings based on their real-world performance.
                Buy packs, unlock new opportunities, and be part of the future
                of sports on the blockchain.
              </Typography>
              <Stack direction="row" gap={2}>
                <Button
                  variant="contained"
                  color="inherit"
                  size="large"
                  sx={{ minWidth: "fit-content", mt: 4 }}
                  startIcon={<PersonSearch />}
                >
                  Explore Players
                </Button>
                <Link href="/buy-pack">
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    sx={{ minWidth: "fit-content", mt: 4 }}
                    startIcon={<CreditCard />}
                  >
                    Buy Pack
                  </Button>
                </Link>
              </Stack>
            </Stack>
          </Glow>
        </Box>
        <Grid2 container spacing={3}>
          <Grid2 size={{ md: 6, xs: 12 }}>
            <StyledBox>
              <Box>
                <Typography variant="h4" textAlign="center">
                  🔥 Why to Buy Packs
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CardGiftcard sx={{ mr: 2 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Surprise and Excitement"
                      secondary="Every pack is a mystery – discover new players and rare items!"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <ArrowUpward sx={{ mr: 2 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Boost Your Team"
                      secondary="Unlock stronger players to increase your rewards."
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Star sx={{ mr: 2 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Exclusive Players"
                      secondary="Find unique athletes that make your team stand out."
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AttachMoney sx={{ mr: 2 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Real Rewards"
                      secondary="Earn real USDC profits based on your players' performance."
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUp sx={{ mr: 2 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Play Smarter"
                      secondary="Put your teams on the field to maximize your benefits and dominate the secondary market."
                    />
                  </ListItem>
                </List>
              </Box>
              <Stack direction="row" justifyContent="center" gap={2}>
                <Button color="inherit" size="large" variant="contained">
                  Explore Packs
                </Button>
                <Button color="primary" size="large" variant="contained">
                  Buy a Pack Now
                </Button>
              </Stack>
            </StyledBox>
          </Grid2>
          <Grid2 size={{ md: 6, xs: 12 }}>
            <StyledBox>
              <Box>
                <Typography variant="h4" textAlign="center">
                  💡 Why to Invest in {TOKEN_SYMBOL} Token
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUp sx={{ mr: 2 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="High Growth Potential"
                      secondary="Be part of an ecosystem that connects entertainment with investments."
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <StarOutline sx={{ mr: 2 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Exclusive Access"
                      secondary="Get special in-game benefits by holding platform tokens."
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Money sx={{ mr: 2 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Passive Rewards"
                      secondary="Earn rewards just by holding your tokens."
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SwapHoriz sx={{ mr: 2 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Market Liquidity"
                      secondary="Easily buy and sell tokens in the marketplace."
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Lightbulb sx={{ mr: 2 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Support Game Development"
                      secondary="Your investments help fund game updates and grow the community."
                    />
                  </ListItem>
                </List>
              </Box>
              <Stack direction="row" justifyContent="center" gap={2}>
                <Button
                  color="inherit"
                  size="large"
                  variant="contained"
                  href="https://funraise.space/presale"
                  target="_blank"
                  sx={{ textAlign: "center" }}
                >
                  Learn More
                </Button>
                <Button
                  color="primary"
                  size="large"
                  variant="contained"
                  href="https://funraise.space/presale"
                  target="_blank"
                  sx={{ textAlign: "center" }}
                >
                  Buy {TOKEN_SYMBOL} Tokens Now
                </Button>
              </Stack>
            </StyledBox>
          </Grid2>
        </Grid2>
      </Container>
    </Box>
  );
}
