import {
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
} from "@mui/material";
import Link from "next/link";

export function GraphicWidget() {
  return (
    <Card>
      <CardContent>
        <Typography
          gutterBottom
          sx={{ color: "text.secondary", fontSize: 14 }}
          variant="overline"
        >
          📊 Earnings
        </Typography>
        <Typography variant="h6" component="div">
          No Earnings Yet, But the Game is Just Beginning!
        </Typography>
        <Typography variant="body2">
          Stake your team and start earning from real-world athlete performance.
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          fullWidth
          sx={{ mt: 2 }}
          LinkComponent={Link}
          href="/staking"
        >
          Know More
        </Button>
        <Button
          size="small"
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          LinkComponent={Link}
          href="/staking/start"
        >
          💎 Start Earning
        </Button>
      </CardActions>
    </Card>
  );
}
