import { Link } from "@mui/icons-material";
import { Button, Stack, Typography } from "@mui/material";
import { CountryFlagEmoji } from "components/CountryFlagEmoji";
import { Card } from "types/card";

interface Props {
  card: Card;
}

export function CardDetails({ card }: Props) {
  const stats = {
    participations: card.metadata?.latestResults.length,
    awards: card.metadata?.latestResults.reduce(
      (acc, r) => (r.awardAmount ?? 0) + acc,
      0,
    ),
    wins: card.metadata?.latestResults.filter((r) => r.result === "Winner")
      .length,
  };
  return (
    <Stack
      gap={1}
      sx={{ minWidth: 300, height: "100%" }}
      justifyContent="space-between"
    >
      <Stack gap={1}>
        <Typography variant="h5">{card.name}</Typography>
        <Typography variant="overline" color="textSecondary">
          <CountryFlagEmoji country={card.country} /> {card.country} | age:{" "}
          {card.metadata?.age} | {card.sport}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            maxWidth: 400,
            maxHeight: 230,
            overflowY: "auto",
            textAlign: "justify",
            lineHeight: 2,
          }}
        >
          {card.metadata?.bio}
        </Typography>
      </Stack>
      <Stack gap={2}>
        <Stack
          direction="row"
          gap={2}
          alignItems="center"
          alignContent="center"
          width="100%"
        >
          <Stack alignItems="center" flex={1}>
            <Typography variant="h5">{stats.participations} 🏟️</Typography>
            <Typography variant="overline" color="textSecondary">
              Tournaments
            </Typography>
          </Stack>
          <Stack alignItems="center" flex={1}>
            <Typography variant="h5">{stats.wins} 🏆</Typography>
            <Typography variant="overline" color="textSecondary">
              Total Wins
            </Typography>
          </Stack>
          <Stack alignItems="center" flex={1}>
            <Typography variant="h5">
              {stats.awards ? `${stats.awards} 💰` : ""}
            </Typography>
            <Typography variant="overline" color="textSecondary">
              Total Awards
            </Typography>
          </Stack>
        </Stack>
        {card.metadata?.profileUrl && (
          <Button
            startIcon={<Link />}
            href={card.metadata?.profileUrl}
            target="_blank"
            referrerPolicy="no-referrer"
          >
            Official Profile
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
