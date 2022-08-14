import { createContext, Dispatch, SetStateAction } from "react";

export interface GuessType {
  id: string
  roundId: number
  guessId: number
  user: string
  guess: number
  winningTime: number
}

export interface GuessesContextInterface {
  guesses: GuessType[]
  setGuesses: Dispatch<SetStateAction<GuessType[] | undefined>>
}

export const GuessesContext = createContext<GuessesContextInterface>({
  guesses: [],
  setGuesses: () => null
});

