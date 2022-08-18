/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  CaptureTheStream,
  CaptureTheStreamInterface,
} from "../CaptureTheStream";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "depositAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
    ],
    name: "Deposit",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "roundId",
        type: "uint256",
      },
    ],
    name: "EndRound",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "roundId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "winningGuessIndex",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "winnerAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "int256",
        name: "winningGuess",
        type: "int256",
      },
      {
        indexed: false,
        internalType: "int256",
        name: "currentPrice",
        type: "int256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timeWinning",
        type: "uint256",
      },
    ],
    name: "EndWinner",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "roundId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "guessIndex",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "int256",
        name: "guess",
        type: "int256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "guessCost",
        type: "uint256",
      },
    ],
    name: "EnterRound",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "roundId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "oracle",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "startTimestamp",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "endTimestamp",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "guessCutOffTimestamp",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "numberOfGuessesAllowed",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "minimumGuessSpacing",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "guessCost",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "inRoundGuessesAllowed",
        type: "bool",
      },
    ],
    name: "InitiateRound",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "roundId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "winningGuessIndex",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "winnerAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "int256",
        name: "winningGuess",
        type: "int256",
      },
      {
        indexed: false,
        internalType: "int256",
        name: "currentPrice",
        type: "int256",
      },
    ],
    name: "StartWinner",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "user",
            type: "address",
          },
          {
            internalType: "int256",
            name: "guess",
            type: "int256",
          },
          {
            internalType: "uint256",
            name: "timeWinning",
            type: "uint256",
          },
        ],
        indexed: false,
        internalType: "struct CaptureTheStream.Guess[]",
        name: "winningGuesses",
        type: "tuple[]",
      },
    ],
    name: "WinningGuesses",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "withdrawAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
    ],
    name: "Withdraw",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    name: "checkUpkeep",
    outputs: [
      {
        internalType: "bool",
        name: "upkeepNeeded",
        type: "bool",
      },
      {
        internalType: "bytes",
        name: "performData",
        type: "bytes",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_depositAmount",
        type: "uint256",
      },
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "depositAsset",
    outputs: [
      {
        internalType: "contract IERC20",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "deposits",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_roundId",
        type: "uint256",
      },
    ],
    name: "endRound",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_roundId",
        type: "uint256",
      },
      {
        internalType: "int256",
        name: "_guess",
        type: "int256",
      },
    ],
    name: "enterRound",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_oracle",
        type: "address",
      },
    ],
    name: "getLatestPrice",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_roundId",
        type: "uint256",
      },
    ],
    name: "getRoundGuesses",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "user",
            type: "address",
          },
          {
            internalType: "int256",
            name: "guess",
            type: "int256",
          },
          {
            internalType: "uint256",
            name: "timeWinning",
            type: "uint256",
          },
        ],
        internalType: "struct CaptureTheStream.Guess[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getRoundsToUpdate",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "guessCost",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_oracle",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_startTimestamp",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_endTimestamp",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_guessCutOffTimestamp",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_numberOfGuessesAllowed",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_minimumGuessSpacing",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_guessCost",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "_inRoundGuessesAllowed",
        type: "bool",
      },
    ],
    name: "initiateRound",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "performData",
        type: "bytes",
      },
    ],
    name: "performUpkeep",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "roundCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "rounds",
    outputs: [
      {
        internalType: "address",
        name: "oracle",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "startTimestamp",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "endTimestamp",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "guessCutOffTimestamp",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "numberOfGuessesAllowed",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minimumGuessSpacing",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "guessCost",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "inRoundGuessesAllowed",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "currentWinnerIndex",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "lastWinnerChange",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deposits",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "roundClosed",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_asset",
        type: "address",
      },
    ],
    name: "setDepositAsset",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_roundId",
        type: "uint256",
      },
    ],
    name: "updateWinner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_withdrawAmount",
        type: "uint256",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export class CaptureTheStream__factory {
  static readonly abi = _abi;
  static createInterface(): CaptureTheStreamInterface {
    return new utils.Interface(_abi) as CaptureTheStreamInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): CaptureTheStream {
    return new Contract(address, _abi, signerOrProvider) as CaptureTheStream;
  }
}
