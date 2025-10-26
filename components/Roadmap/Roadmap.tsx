"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import { Chip } from "./Roadmap.styled";
import {
  SportsScore,
  SwapHorizontalCircle,
  EmojiEvents,
} from "@mui/icons-material";
import { useIsMobile } from "../../lib/hooks/useIsMobile";
import { TOKEN_SYMBOL } from "../../lib/constants";

const items = [
  {
    icon: <SportsScore />,
    title: "Milestone 1: Token Launch and Initial Marketplace",
    description: `Launch funraise's ${TOKEN_SYMBOL} token and open the marketplace for buying and selling players. Early adopters will gain exclusive access to packs and benefits.`,
    imageLight: `url("https://mui.com/static/images/templates/templates-images/dash-light.png")`,
    imageDark: `url("https://mui.com/static/images/templates/templates-images/dash-dark.png")`,
  },
  {
    icon: <EmojiEvents />,
    title: "Milestone 2: Staking and Rewards System",
    description:
      'We will implement a system where users can put their teams "on the field" to earn rewards. This update will also include detailed performance stats and key match dates to encourage strategic gameplay.',
    imageLight: `url("https://mui.com/static/images/templates/templates-images/mobile-light.png")`,
    imageDark: `url("https://mui.com/static/images/templates/templates-images/mobile-dark.png")`,
  },
  {
    icon: <SwapHorizontalCircle />,
    title: "Milestone 3: Advanced Trading and Community Features",
    description:
      "Enhance the marketplace with advanced trading options, such as auctions and player rentals. We will also launch community features like leaderboards, team showcases, and player sponsorship opportunities.",
    imageLight: `url("https://mui.com/static/images/templates/templates-images/devices-light.png")`,
    imageDark: `url("https://mui.com/static/images/templates/templates-images/devices-dark.png")`,
  },
];

interface MobileLayoutProps {
  selectedItemIndex: number;
  handleItemClick: (index: number) => void;
  selectedFeature: (typeof items)[0];
}

export function MobileLayout({
  selectedItemIndex,
  handleItemClick,
  selectedFeature,
}: MobileLayoutProps) {
  if (!items[selectedItemIndex]) {
    return null;
  }

  return (
    <Box
      sx={{
        display: { xs: "flex", sm: "none" },
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", gap: 2, overflow: "auto" }}>
        {items.map(({ title }, index) => (
          <Chip
            size="medium"
            key={index}
            label={title}
            onClick={() => handleItemClick(index)}
            selected={selectedItemIndex === index}
          />
        ))}
      </Box>
      <Card variant="outlined">
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-expect-error */}
        <Box
          sx={(theme) => ({
            mb: 2,
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: 280,
            backgroundImage: "var(--items-imageLight)",
            ...theme.applyStyles("dark", {
              backgroundImage: "var(--items-imageDark)",
            }),
          })}
          style={
            items[selectedItemIndex]
              ? {
                  "--items-imageLight": items[selectedItemIndex].imageLight,
                  "--items-imageDark": items[selectedItemIndex].imageDark,
                }
              : {}
          }
        />
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography
            gutterBottom
            sx={{ color: "text.primary", fontWeight: "medium" }}
          >
            {selectedFeature.title}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5 }}>
            {selectedFeature.description}
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}

export default function Roadmap() {
  const isMobile = useIsMobile();
  const [selectedItemIndex, setSelectedItemIndex] = React.useState(0);

  const handleItemClick = (index: number) => {
    setSelectedItemIndex(index);
  };

  const selectedFeature = items[selectedItemIndex];

  return (
    <>
      <Container id="features" sx={{ py: { xs: 10, sm: 12 } }}>
        <Box textAlign="center" sx={{ maxWidth: 800, margin: "auto", pb: 8 }}>
          <Typography
            component="h2"
            variant="h2"
            gutterBottom
            sx={{ color: "text.primary" }}
          >
            Our Roadmap
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Explore our journey of innovation and growth. Each milestone
            represents a step toward building a dynamic ecosystem where players,
            tokens, and strategies redefine the gaming experience. Join us as we
            build the future, one milestone at a time.
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row-reverse" },
            gap: 2,
          }}
        >
          <div>
            <Box
              sx={{
                display: { xs: "none", sm: "flex" },
                flexDirection: "column",
                gap: 2,
                height: "100%",
              }}
            >
              {items.map(({ icon, title, description }, index) => (
                <Box
                  key={index}
                  component={Button}
                  onClick={() => handleItemClick(index)}
                  sx={[
                    (theme) => ({
                      p: 2,
                      height: "100%",
                      width: "100%",
                      "&:hover": {
                        backgroundColor: (theme.vars || theme).palette.action
                          .hover,
                      },
                    }),
                    selectedItemIndex === index && {
                      backgroundColor: "action.selected",
                    },
                  ]}
                >
                  <Box
                    sx={[
                      {
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "left",
                        gap: 1,
                        textAlign: "left",
                        textTransform: "none",
                        color: "text.secondary",
                      },
                      selectedItemIndex === index && {
                        color: "text.primary",
                      },
                    ]}
                  >
                    {icon}
                    <Typography variant="h6">{title}</Typography>
                    <Typography variant="body2">{description}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
            {selectedFeature && (
              <MobileLayout
                selectedItemIndex={selectedItemIndex}
                handleItemClick={handleItemClick}
                selectedFeature={selectedFeature}
              />
            )}
          </div>
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              width: { xs: "100%", md: "70%" },
              height: "var(--items-image-height)",
            }}
          >
            <Card
              variant="outlined"
              sx={{
                height: "100%",
                width: "100%",
                display: { xs: "none", sm: "flex" },
                pointerEvents: "none",
              }}
            >
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-expect-error */}
              <Box
                sx={(theme) => ({
                  m: "auto",
                  width: 420,
                  height: 500,
                  backgroundSize: "contain",
                  backgroundImage: "var(--items-imageLight)",
                  ...theme.applyStyles("dark", {
                    backgroundImage: "var(--items-imageDark)",
                  }),
                })}
                style={
                  items[selectedItemIndex]
                    ? {
                        "--items-imageLight":
                          items[selectedItemIndex].imageLight,
                        "--items-imageDark": items[selectedItemIndex].imageDark,
                      }
                    : {}
                }
              />
            </Card>
          </Box>
        </Box>
      </Container>
      <Container sx={{ py: isMobile ? 1 : 3 }}>
        <Typography
          component="div"
          variant={isMobile ? "h4" : "h2"}
          textAlign="center"
          py={6}
          sx={{ transform: "scale(1.5)" }}
        >
          Don’t Just Watch
          <Typography
            color="primary"
            component="div"
            variant={isMobile ? "h2" : "h3"}
          >
            Own the Game
          </Typography>
        </Typography>
      </Container>
    </>
  );
}
