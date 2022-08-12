import { createContext } from "react";

export interface RoundContextInterface {
  roundId: number
  setRoundId: () => null
}

export const RoundCtx = createContext<RoundContextInterface | null>(null);