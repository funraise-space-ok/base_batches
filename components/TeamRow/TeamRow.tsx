"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  TableRow,
  TableCell,
  Button,
  Chip,
  ChipProps,
  CircularProgress,
  Stack,
  Typography,
  Zoom,
  Box,
  Skeleton,
  keyframes,
} from "@mui/material";
import {
  CheckCircle,
  RocketLaunch,
  Schedule,
  Stadium,
  Stop,
} from "@mui/icons-material";

// Animation for loading state
const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;
import { Card as PlayerCard } from "components/Card";
import { CardDetails } from "components/CardDetails";
import { BaseTeam, TeamStateName, useBaseProgram } from "lib/base/useBaseProgram";
import { useCountdown } from "hooks/useCountdown";

const TEAM_STATUS_LABELS: Record<TeamStateName, string> = {
  Free: "Free",
  WarmingUp: "Warming Up",
  OnField: "On Field",
  ToWithdraw: "Withdrawing",
};

const TEAM_STATUS_COLORS: Record<TeamStateName, ChipProps["color"]> = {
  Free: "default",
  WarmingUp: "warning",
  OnField: "success",
  ToWithdraw: "info",
};

interface TeamRowProps {
  teamId: number;
  onAction: (action: string, teamId: number) => Promise<void>;
  isStaked?: boolean;
  cardZoom?: number;
  containerGradient?: string;
  overlayBg?: string;
  overlapCards?: boolean;
}

interface TeamWithCards extends BaseTeam {
  cards?: any[];
  transitionTimestamp?: number;
}

const TeamActionButton = ({
  team,
  onAction,
  isLoading,
  isStaked,
  timeLock,
}: {
  team: TeamWithCards;
  onAction: (action: string, teamId: number) => Promise<void>;
  isLoading?: boolean;
  isStaked?: boolean;
  timeLock: number;
}) => {
  const handleAction = useCallback(
    async (action: string) => {
      try {
        await onAction(action, team.teamId);
      } catch (error) {
        console.error("Error in handleAction:", error);
        throw error;
      }
    },
    [onAction, team]
  );

  // Calculate countdown
  const targetTimestamp =
    (team.state === "WarmingUp" || team.state === "ToWithdraw") && team.transitionTimestamp
      ? team.transitionTimestamp + timeLock
      : 0;
  const countdownResult = useCountdown(targetTimestamp);
  const formattedTime = countdownResult.formattedTime;
  const isExpired =
    team.state === "WarmingUp" || team.state === "ToWithdraw"
      ? countdownResult.isExpired
      : false;

  const getActionConfig = () => {
    if (isStaked) {
      switch (team.state) {
        case "WarmingUp":
          if (isExpired) {
            return {
              action: "check_transition",
              label: "Enter the Field!",
              icon: <Stadium />,
              color: "primary" as const,
              variant: "contained" as const,
            };
          } else {
            return {
              action: "warming_up",
              label: `${formattedTime}`,
              icon: <Schedule />,
              color: "warning" as const,
              variant: "contained" as const,
              disabled: true,
            };
          }
        case "OnField":
          return {
            action: "withdraw",
            label: "Withdraw",
            icon: <Stop />,
            color: "error" as const,
            variant: "contained" as const,
          };
        case "ToWithdraw":
          if (isExpired) {
            return {
              action: "complete_withdraw",
              label: "✨ Complete Withdraw ✨",
              icon: <CheckCircle />,
              color: "success" as const,
              variant: "contained" as const,
            };
          } else {
            return {
              action: "withdrawing",
              label: `⏰ ${formattedTime}`,
              icon: null,
              color: "info" as const,
              variant: "contained" as const,
              disabled: true,
            };
          }
        default:
          return null;
      }
    } else {
      if (team.state === "Free") {
        return {
          action: "stake",
          label: "Warm Up",
          icon: <RocketLaunch />,
          color: "warning" as const,
          variant: "contained" as const,
        };
      }
      return null;
    }
  };

  const config = getActionConfig();

  if (!config) {
    return (
      <Button disabled variant="outlined" size="small">
        {isStaked ? "No Action" : "Not Available"}
      </Button>
    );
  }

  return (
    <Button
      onClick={() => handleAction(config.action)}
      disabled={isLoading || config.disabled}
      color={config.color}
      variant={config.variant}
      size="small"
      startIcon={isLoading ? <CircularProgress size={16} /> : config.icon}
      sx={{
        width: "100%",
        minWidth: "200px",
        ...(config.action === "stake" && {
          background: "#512DA8",
          "&:hover": {
            background: "#3E2285",
          },
        }),
        ...(config.action === "check_transition" && {
          background: "linear-gradient(45deg, #6a1b9a 30%, #8e24aa 90%) !important",
          color: "white !important",
          border: "1px solid rgba(156, 39, 176, 0.5)",
          borderRadius: "8px",
          boxShadow: "0 0 12px rgba(156, 39, 176, 0.35)",
          "&:hover": {
            background: "linear-gradient(45deg, #8e24aa 30%, #ab47bc 90%) !important",
            boxShadow: "0 4px 20px rgba(156, 39, 176, 0.4)",
          },
        }),
        ...(config.action === "complete_withdraw" && {
          background: "linear-gradient(45deg, #1976D2 30%, #2196F3 90%) !important",
          color: "white !important",
          border: "1px solid rgba(33, 150, 243, 0.5)",
          borderRadius: "8px",
          boxShadow: "0 0 12px rgba(33, 150, 243, 0.35)",
          "&:hover": {
            background: "linear-gradient(45deg, #2196F3 30%, #64B5F6 90%) !important",
            boxShadow: "0 4px 20px rgba(33, 150, 243, 0.4)",
          },
        }),
        ...(config.action === "withdrawing" && {
          background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%) !important",
          color: "white !important",
          fontWeight: "bold",
          animation: "pulse 2s infinite",
          border: "2px solid rgba(33, 150, 243, 0.3)",
          "&:disabled": {
            background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%) !important",
            color: "white !important",
            opacity: "1 !important",
          },
        }),
        ...(config.action === "warming_up" && {
          animation: "pulse 2s infinite",
          background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%) !important",
          color: "white !important",
          "&:disabled": {
            background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%) !important",
            color: "white !important",
            opacity: "1 !important",
          },
        }),
      }}
    >
      {isLoading ? "Loading..." : config.label}
    </Button>
  );
};

export const TeamRow = React.memo(function TeamRow({
  teamId,
  onAction,
  isStaked = false,
  cardZoom = 0.26,
  containerGradient,
  overlayBg,
  overlapCards = false,
}: TeamRowProps) {
  const { getTeamDetail, getPlayersByIds, getTimeLockSeconds } = useBaseProgram();
  const [team, setTeam] = useState<TeamWithCards | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [timeLock, setTimeLock] = useState(0);

  const loadTeamData = useCallback(async () => {
    try {
      setLoading(true);
      const teamData = await getTeamDetail(teamId);
      if (!teamData) {
        setTeam(null);
        return;
      }

      // Load players
      const players = teamData.playerIds ? await getPlayersByIds(teamData.playerIds) : [];

      // Convert players to cards
      const cards = players.map((player) => ({
        id: player.id,
        name: player.name,
        type: player.category.toLowerCase() as "bronze" | "silver" | "gold",
        image: player.name,
        country: player.country,
        discipline: player.discipline,
      }));

      setTeam({
        ...teamData,
        cards,
      });
      
      console.log(`[TeamRow] Team ${teamId} loaded with state:`, teamData.state);
    } catch (error) {
      console.error("Error loading team data:", error);
      setTeam(null);
    } finally {
      setLoading(false);
    }
  }, [teamId, getTeamDetail, getPlayersByIds]);

  useEffect(() => {
    loadTeamData();
    getTimeLockSeconds().then(setTimeLock);
  }, [loadTeamData, getTimeLockSeconds]);

  const handleAction = useCallback(
    async (action: string, teamId: number) => {
      try {
        setActionLoading(true);
        await onAction(action, teamId);
        
        // Wait a bit longer for blockchain to update state
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Force reload team data to get the new state from blockchain
        await loadTeamData();
      } catch (error) {
        console.error("Error in TeamRow handleAction:", error);
        // If error, reload anyway to ensure consistency
        try {
          await loadTeamData();
        } catch (reloadError) {
          console.error("Error reloading team data:", reloadError);
        }
      } finally {
        setActionLoading(false);
      }
    },
    [onAction, loadTeamData]
  );

  if (loading || actionLoading) {
    return (
      <TableRow>
        <TableCell component="td" scope="row" colSpan={3}>
          <Stack spacing={1} alignItems="center">
            <Stack direction="row" gap={0.5} justifyContent="center">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  width={54}
                  height={72}
                  sx={{ 
                    borderRadius: 1, 
                    animation: `${pulse} 1.5s ease-in-out infinite`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </Stack>
            {actionLoading && (
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="caption" color="text.secondary">
                  Procesando transacción...
                </Typography>
              </Stack>
            )}
            {!actionLoading && (
              <Box display="flex" justifyContent="flex-end">
                <Skeleton variant="rounded" width={130} height={32} />
              </Box>
            )}
          </Stack>
        </TableCell>
      </TableRow>
    );
  }

  if (!team) {
    return (
      <TableRow>
        <TableCell colSpan={3} align="center">
          <Typography variant="body2" color="error">
            Error loading team {teamId}
          </Typography>
        </TableCell>
      </TableRow>
    );
  }

  const cards = team.cards ?? [];

  return (
    <TableRow sx={{ width: "100%", "&:last-child td, &:last-child th": { border: 0 } }}>
      <TableCell
        component="td"
        scope="row"
        colSpan={3}
        sx={{ p: 1.5, overflow: "visible", display: "flex", justifyContent: "center" }}
      >
        <Box
          sx={{
            position: "relative",
            borderRadius: 2,
            p: 0.75,
            width: containerGradient ? "100%": "fit-content",
            boxSizing: "border-box",
            mx: "auto",
            background:
              containerGradient ||
              "linear-gradient(135deg, rgba(80,80,255,0.35), rgba(0,200,150,0.35))",
            boxShadow:
              "0 0 18px rgba(90, 200, 255, 0.15), inset 0 0 8px rgba(0, 255, 200, 0.15)",
            outline: "1px solid rgba(255,255,255,0.06)",
            outlineOffset: 3,
            overflow: "visible",
          }}
        >
          <Box
            sx={{
              borderRadius: 1.5,
              p: 1,
              backgroundColor: overlayBg || "rgba(10,10,10,0.5)",
              backdropFilter: "blur(4px)",
              display: "flex",
              justifyContent: "center",
              width: overlapCards ? "fit-content" : "100%",
              boxSizing: "border-box",
              maxWidth: "100%",
              overflow: "visible",
            }}
          >
            <Stack spacing={1} sx={{ width: "fit-content", alignItems: "center", position: "relative" }}>
              {!overlapCards ? (
                <Stack direction="row" gap={0.6} justifyContent="center" sx={{ px: 0.5 }}>
                  {cards.map((card: any, index: number) => (
                    <Zoom
                      key={`${team.teamId}-${index}`}
                      in={true}
                      timeout={600}
                      style={{ transitionDelay: `${index * 100}ms` }}
                    >
                      <div style={{ display: "inline-block" }}>
                        <PlayerCard
                          sx={{ zoom: cardZoom }}
                          expandable
                          {...card}
                          details={<CardDetails card={card} />}
                        />
                      </div>
                    </Zoom>
                  ))}
                </Stack>
              ) : (
                <Box sx={{ px: 0.5, display: "flex", justifyContent: "center", overflow: "visible" }}>
                  {(() => {
                    const BASE_CARD_WIDTH_PX = 112;
                    const BASE_CARD_HEIGHT_PX = 160;
                    const scale = cardZoom ?? 1;
                    const DISPLAY_WIDTH_PX = Math.max(1, Math.round(BASE_CARD_WIDTH_PX * scale));
                    const DISPLAY_HEIGHT_PX = Math.max(1, Math.round(BASE_CARD_HEIGHT_PX * scale));
                    const OVERLAP_PX = Math.round(DISPLAY_WIDTH_PX / 3);
                    const STEP_PX = DISPLAY_WIDTH_PX - OVERLAP_PX;
                    const STRIP_WIDTH_PX = DISPLAY_WIDTH_PX + Math.max(0, cards.length - 1) * STEP_PX;
                    const EXTRA_CLEARANCE_PX = 80;
                    return (
                      <Box
                        sx={{
                          position: "relative",
                          width: `${STRIP_WIDTH_PX}px`,
                          height: `${DISPLAY_HEIGHT_PX}px`,
                          overflow: "visible",
                          mb: `${EXTRA_CLEARANCE_PX}px`,
                        }}
                      >
                        {cards.map((card: any, index: number) => (
                          <Zoom
                            key={`${team.teamId}-ov-${index}`}
                            in={true}
                            timeout={500}
                            style={{ transitionDelay: `${index * 90}ms` }}
                          >
                            <Box
                              sx={{
                                position: "absolute",
                                left: `${index * STEP_PX}px`,
                                top: 0,
                                width: `${DISPLAY_WIDTH_PX}px`,
                                zIndex: 10 + index,
                                "&:hover": { zIndex: 100 + index },
                              }}
                            >
                              <PlayerCard
                                sx={{ zoom: cardZoom }}
                                expandable
                                {...card}
                                details={<CardDetails card={card} />}
                              />
                            </Box>
                          </Zoom>
                        ))}
                      </Box>
                    );
                  })()}
                </Box>
              )}

              <Box display="flex" justifyContent="center" width="100%" sx={{ mt: isStaked ? 3 : 4 }}>
                <TeamActionButton
                  team={team}
                  onAction={handleAction}
                  isLoading={actionLoading}
                  isStaked={isStaked}
                  timeLock={timeLock}
                />
              </Box>
            </Stack>
          </Box>
        </Box>
      </TableCell>
    </TableRow>
  );
});

