import { NetworkID } from '@dethcrypto/eth-sdk/dist/abi-management/networks'
import { TExternalContractsAddressMap } from 'eth-hooks/models'

/**
 * ⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️
 * #### Instructions
 * - Add your contracts to the list here
 * - The format is described by {@link TExternalContractsAddressMap}
 *
 * ### Summary
 * The list of external contracts use by the app.
 * it is used to generate the type definitions for the external contracts by `yarn contracts:build`
 * provide the name and address of the external contract and the definition will be generated
 */
export const externalContractsAddressMap: TExternalContractsAddressMap = {
  [31337]: {
    AggregatorV3Interface: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    CaptureTheStream: '0x9A676e781A523b5d0C0e43731313A708CB607508',
    MockDAI: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
  },
  [80001]: {
    AggregatorV3Interface: '0x0715A7794a1dc8e42615F059dD6e406A6594651A',
    CaptureTheStream: '0xf47E5F4Ee4bE7D88309E2a0dDc99f2ccf0C3eDB0',
    MockDAI: '0xE81Fca457ba225C7D0921207f0b24444b9303944'
  }
}
