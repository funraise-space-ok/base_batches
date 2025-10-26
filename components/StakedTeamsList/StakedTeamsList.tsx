"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Typography,
  CircularProgress,
} from "@mui/material";
import { TeamRow } from "components/TeamRow";
import { useBaseProgram, TeamStateName } from "lib/base/useBaseProgram";
import TablePagination from "@mui/material/TablePagination";

interface StakedTeamsListProps {
  stakedTeamIds: number[];
  onTeamWithdrawn?: (teamId: number) => void;
  onTeamsCountChange?: (count: number) => void;
  isLoading?: boolean;
  onTeamTransitioned?: (teamId: number) => void;
  section?: "warming_up" | "on_field" | "to_withdraw";
}

export function StakedTeamsList({
  stakedTeamIds = [],
  onTeamWithdrawn,
  onTeamsCountChange,
  isLoading = false,
  onTeamTransitioned,
  section = "on_field",
}: StakedTeamsListProps) {
  const { setTeamStake, refreshTeamStatus } = useBaseProgram();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (onTeamsCountChange && !isLoading) {
      onTeamsCountChange(stakedTeamIds.length);
    }
  }, [stakedTeamIds.length, onTeamsCountChange, isLoading]);

  const handleTeamAction = useCallback(
    async (action: string, teamId: number) => {
      try {
        if (action === "withdraw") {
          // Start withdraw process (OnField -> ToWithdraw)
          // Wait for transaction to complete
          await setTeamStake(teamId, false);
          
          // Small delay to ensure blockchain state is updated
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Only after confirmation, notify dashboard to move team
          // Team will appear in TO WITHDRAW with countdown button
          if (onTeamWithdrawn && section === "on_field") {
            onTeamWithdrawn(teamId);
          }
        } else if (action === "check_transition") {
          // WarmingUp -> OnField
          // Wait for transaction to complete
          await refreshTeamStatus(teamId);
          
          // Play on field sound
          try {
            const onFieldAudio = new Audio('/audio/enter_the_field.wav');
            onFieldAudio.volume = 1.0;
            onFieldAudio.play().catch(() => {});
          } catch {}
          
          // Small delay to ensure blockchain state is updated
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Only after confirmation, notify dashboard to move team
          // Team will appear in ON FIELD with "Withdraw" button
          if (onTeamTransitioned) {
            onTeamTransitioned(teamId);
          }
        } else if (action === "complete_withdraw") {
          // ToWithdraw -> Free
          // Wait for transaction to complete
          await refreshTeamStatus(teamId);
          
          // Small delay to ensure blockchain state is updated
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Only after confirmation, notify dashboard to move team
          // Team will return to MY WALLET with "Warm Up" button
          if (onTeamWithdrawn) {
            onTeamWithdrawn(teamId);
          }
        }
      } catch (error) {
        console.error("Error in team action:", error);
        // Don't move team if transaction failed
        throw error;
      }
    },
    [setTeamStake, refreshTeamStatus, onTeamWithdrawn, onTeamTransitioned, section]
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isLoading && stakedTeamIds.length === 0) {
    if (section === "warming_up") {
      return (
        <Box display="flex" justifyContent="center" py={4}>
          <Typography variant="body2" color="textSecondary">
            This is the warm-up area; your teams wait here before entering the field.
          </Typography>
        </Box>
      );
    } else if (section === "to_withdraw") {
      return (
        <Box display="flex" justifyContent="center" py={4}>
          <Typography variant="body2" color="textSecondary">
            There is nothing to withdraw here.
          </Typography>
        </Box>
      );
    } else {
      return (
        <Box display="flex" justifyContent="center" py={4}>
          <Typography variant="body2" color="textSecondary">
            There are no teams playing. Don't waste time—let the game begin!
          </Typography>
        </Box>
      );
    }
  }

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedIds = stakedTeamIds.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <TableContainer
      component={Paper}
      sx={{ width: section === "to_withdraw" ? "100%" : "90%", mx: "auto", mt: section === "to_withdraw" ? 0 : 0 }}
    >
      <Table aria-label="staked teams table" size="small">
        <TableBody>
          {paginatedIds.map((teamId, idx) => (
            <React.Fragment key={`staked-wrap-${teamId}`}>
              <TeamRow
                key={`staked-${teamId}`}
                teamId={teamId}
                onAction={handleTeamAction}
                isStaked={true}
                cardZoom={section === "to_withdraw" ? 0.42 : 0.4}
                containerGradient={
                  section === "warming_up"
                    ? "linear-gradient(135deg, rgba(255,152,0,0.25), rgba(255,193,7,0.15))"
                    : section === "on_field"
                    ? "linear-gradient(135deg, rgba(76,175,80,0.25), rgba(129,199,132,0.15))"
                    : section === "to_withdraw"
                    ? "linear-gradient(135deg, rgba(33,150,243,0.28), rgba(3,169,244,0.18))"
                    : undefined
                }
                overlayBg={
                  section === "warming_up"
                    ? "rgba(20,20,20,0.45)"
                    : section === "on_field"
                    ? "rgba(20,30,20,0.35)"
                    : section === "to_withdraw"
                    ? "rgba(10,18,28,0.48)"
                    : undefined
                }
                overlapCards={section === "to_withdraw"}
              />
              {idx < paginatedIds.length - 1 && (
                <TableRow>
                  <TableCell colSpan={3} sx={{ py: 0.5 }}>
                    <Box
                      sx={{
                        height: 3,
                        background:
                          "linear-gradient(90deg, rgba(90,200,255,0.35), rgba(0,255,200,0.35))",
                        borderRadius: 1,
                      }}
                    />
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
      {stakedTeamIds.length > 5 && (
        <TablePagination
          component="div"
          count={stakedTeamIds.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Teams per page:"
        />
      )}
    </TableContainer>
  );
}

