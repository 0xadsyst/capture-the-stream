import { createContext } from "react";

export interface RoundType {
  roundId: number
  oracle: string
  startTimestamp: number
  endTimestamp: number
  guessCutOffTimestamp: number
  numberOfGuessesAllowed: number
  minimumGuessSpacing: number
  guessCost: number
  inRoundGuessesAllowed: boolean
  currentWinner: number
  lastWinnerChange: number
  deposits: number
}

export interface RoundsContextInterface {
  rounds: RoundType[]
  setRounds: Function
}

export const RoundsCtx = createContext<RoundsContextInterface>({
  rounds: [],
  setRounds: () => null
});

