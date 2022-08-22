import { createContext, Dispatch, SetStateAction } from "react";

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
  roundClosed: boolean
}

export interface RoundsContextInterface {
  rounds: RoundType[]
  setRounds: Dispatch<SetStateAction<RoundType[] | undefined>>
}

export const RoundsContext = createContext<RoundsContextInterface>({
  rounds: [],
  setRounds: () => null
});

