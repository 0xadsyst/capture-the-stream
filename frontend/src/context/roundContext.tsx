import { createContext } from "react";

export interface RoundContextInterface {
  roundId: number
  setRoundId: (roundId: number) => null
}

export const RoundCtx = createContext<RoundContextInterface | null>(null);