import { createContext } from "react";

export interface RoundType {
  roundId: number
  startTimestamp: number
  endTimestamp: number
  currentWinner: number
}

export interface RoundsContextInterface {
  rounds: RoundType[]
  setRounds: Function
}

export const RoundsCtx = createContext<RoundsContextInterface>({
  rounds: [],
  setRounds: () => null
});

