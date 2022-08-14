import { createContext, Dispatch, SetStateAction } from "react";

export interface RoundContextInterface {
  roundId: number
  setRoundId: Dispatch<SetStateAction<number | undefined>>
}

export const RoundCtx = createContext<RoundContextInterface | null>(null);