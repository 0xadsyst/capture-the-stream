import { createContext } from "react";

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
  setGuesses: (guesses: GuessType[]) => null
}

export const GuessesContext = createContext<GuessesContextInterface>({
  guesses: [],
  setGuesses: () => null
});

