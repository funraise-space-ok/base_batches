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
  Stack,
} from "@mui/material";
import { TeamRow } from "components/TeamRow";
import { useBaseProgram } from "lib/base/useBaseProgram";
import TablePagination from "@mui/material/TablePagination";

interface UserTeamsListProps {
  onTeamStaked?: (teamId: number) => void;
  onTeamsCountChange?: (count: number) => void;
  refreshKey?: number;
}

export function UserTeamsList({
  onTeamStaked,
  onTeamsCountChange,
  refreshKey = 0,
}: UserTeamsListProps) {
  const { getUserTeams, setTeamStake } = useBaseProgram();
  const [userTeamIds, setUserTeamIds] = useState<number[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadUserTeams = useCallback(async () => {
    try {
      setInitialLoading(true);
      setUserTeamIds([]);

      const userTeams = await getUserTeams();
      // Filter only Free teams
      const freeTeams = userTeams.filter((t) => !t.staked);
      setUserTeamIds(freeTeams.map((t) => t.teamId));

      setInitialLoading(false);
    } catch (error) {
      console.error("Error loading user teams:", error);
      setUserTeamIds([]);
      setInitialLoading(false);
    }
  }, [getUserTeams, refreshKey]);

  useEffect(() => {
    loadUserTeams();
  }, [loadUserTeams]);

  useEffect(() => {
    if (onTeamsCountChange && !initialLoading) {
      onTeamsCountChange(userTeamIds.length);
    }
  }, [userTeamIds.length, onTeamsCountChange, initialLoading]);

  const handleTeamAction = useCallback(
    async (action: string, teamId: number) => {
      if (action === "stake") {
        try {
          // Wait for transaction to complete
          await setTeamStake(teamId, true);
          
          // Play warm up sound
          try {
            const warmupAudio = new Audio('/audio/enter_the_field.mp3');
            warmupAudio.volume = 1.0;
            warmupAudio.play().catch(() => {});
          } catch {}
          
          // Small delay to ensure blockchain state is updated
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Only after successful confirmation, remove from MY WALLET
          setUserTeamIds((prev) => prev.filter((id) => id !== teamId));
          
          // Notify dashboard to add to WARMING UP section
          // The team will appear there with the countdown button
          if (onTeamStaked) {
            onTeamStaked(teamId);
          }
        } catch (error) {
          console.error("Error staking team:", error);
          // Don't remove from list if transaction failed
          throw error;
        }
      }
    },
    [setTeamStake, onTeamStaked]
  );

  if (initialLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!initialLoading && userTeamIds.length === 0) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <Typography variant="body2" color="textSecondary">
          No teams in your wallet.
        </Typography>
      </Box>
    );
  }

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedIds = userTeamIds.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Stack spacing={2} alignItems="center">
      <TableContainer component={Paper} sx={{ width: "fit-content", mx: "auto", mt: 2 }}>
        <Table aria-label="user teams table" size="small">
          <TableBody>
            {paginatedIds.map((teamId, idx) => (
              <React.Fragment key={`user-wrap-${teamId}`}>
                <TeamRow
                  key={`user-${teamId}`}
                  teamId={teamId}
                  onAction={handleTeamAction}
                  isStaked={false}
                  overlapCards
                  cardZoom={0.42}
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
        {userTeamIds.length > 5 && (
          <TablePagination
            component="div"
            count={userTeamIds.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Teams per page:"
          />
        )}
      </TableContainer>
    </Stack>
  );
}

