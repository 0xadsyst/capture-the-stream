import { createContext, Dispatch, SetStateAction } from "react";

export interface RoundContextInterface {
  roundId: number | null
  setRoundId: Dispatch<SetStateAction<number | undefined>>
}

export const RoundContext = createContext<RoundContextInterface>({
  roundId: null,
  setRoundId: () => null
});
