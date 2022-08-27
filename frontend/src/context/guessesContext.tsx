import { createContext, Dispatch, SetStateAction } from "react";

export interface GuessType {
  id: string
  roundId: number
  guessId: number
  user: string
  guess: number
  winningTime: number
  disableEndTimestamp: number
  enableEndTimestamp: number
}

export interface GuessesContextInterface {
  guesses: GuessType[]
  setGuesses: Dispatch<SetStateAction<GuessType[] | undefined>>
}

export const SubgraphDataContext = createContext<GuessesContextInterface>({
  guesses: [],
  setGuesses: () => null
});

