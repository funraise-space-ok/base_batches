import { Card } from "./card";

export enum TeamStatus {
  FREE = "FREE",
  WARMING_UP = "WARMING_UP", 
  ON_FIELD = "ON_FIELD",
  STARTED_WITHDRAW = "STARTED_WITHDRAW",
  TO_WITHDRAW = "TO_WITHDRAW",
  STRETCHING = "STRETCHING",
}

export interface Team {
  id: string;
  cards: Card[];
  profit: number;
  status: TeamStatus;
}
