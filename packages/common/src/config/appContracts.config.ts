/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { createConnectorForExternalContract, createConnectorForHardhatContract } from 'eth-hooks/context';
import { invariant } from 'ts-invariant';

import { externalContractsAddressMap } from './externalContracts.config';

import * as hardhatContracts from '~common/generated/';
import * as externalContracts from '~common/generated/external-contracts/esm/types';
import hardhatDeployedContractsJson from '~common/generated/hardhat_contracts.json';

/**
 * ⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️
 * ### Instructions
 * 1. edit externalContracts.config.ts to add your external contract addresses.
 * 2. edit `appContractsConfig` function below and add them to the list
 * 3. run `yarn contracts:build` to generate types for contracts
 * 4. run `yarn deploy` to generate hardhat_contracts.json
 *
 * ### Summary
 * - called  by useAppContracts
 * @returns
 */
export const appContractsConfig = () => {
  try {
    const result = {
      // --------------------------------------------------
      // 🙋🏽‍♂️ Add your hadrdhat contracts here
      // --------------------------------------------------
      CaptureTheStream: createConnectorForHardhatContract(
        'CaptureTheStream',
        hardhatContracts.CaptureTheStream__factory,
        hardhatDeployedContractsJson
      ),
      MockChainlinkAggregatorETH: createConnectorForHardhatContract(
        'MockChainlinkAggregatorETH',
        hardhatContracts.MockChainlinkAggregatorETH__factory,
        hardhatDeployedContractsJson
      ),
      MockChainlinkAggregatorBTC: createConnectorForHardhatContract(
        'MockChainlinkAggregatorBTC',
        hardhatContracts.MockChainlinkAggregatorBTC__factory,
        hardhatDeployedContractsJson
      ),
      MockChainlinkAggregatorMATIC: createConnectorForHardhatContract(
        'MockChainlinkAggregatorMATIC',
        hardhatContracts.MockChainlinkAggregatorMATIC__factory,
        hardhatDeployedContractsJson
      ),
      MockDAI: createConnectorForHardhatContract(
        'MockDAI',
        hardhatContracts.MockDAI__factory,
        hardhatDeployedContractsJson
      ),
      MockVRFCoordinatorV2: createConnectorForHardhatContract(
        'MockVRFCoordinatorV2',
        hardhatContracts.MockVRFCoordinatorV2__factory,
        hardhatDeployedContractsJson
      ),
      // --------------------------------------------------
      // 🙋🏽‍♂️ Add your external contracts here, make sure to define the address in `externalContractsConfig.ts`Í
      // --------------------------------------------------
      //DAI: createConnectorForExternalContract('DAI', externalContracts.DAI__factory, externalContractsAddressMap),

      // --------------------------------------------------
      // 🙋🏽‍♂️ Add your external abi here (unverified contracts)`
      // --------------------------------------------------
      // YourContract: createConnectorForExternalAbi(
      //   'YourContract',
      //   {
      //     [TARGET_NETWORK_INFO.chainId]: {
      //       address: 'xxx',
      //       chainId: TARGET_NETWORK_INFO.chainId,
      //     },
      //   },
      //   hardhatContracts.YourContract__factory.abi,
      //   hardhatContracts.YourContract__factory.connect
      // ),
    } as const;

    return result;
  } catch (e) {
    invariant.error(
      '❌ appContractsConfig: ERROR with loading contracts please run `yarn contracts:build or yarn contracts:rebuild`.  Then run `yarn deploy`!'
    );
    invariant.error(e);
  }

  return undefined;
};
