import { createContext } from "react";

export interface RoundContextInterface {
  roundId: number
  setRoundId: Function
}

export const RoundCtx = createContext<RoundContextInterface | null>(null);