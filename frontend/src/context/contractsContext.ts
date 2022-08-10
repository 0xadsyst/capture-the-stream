import { contractsContextFactory } from 'eth-hooks/context';
import { TTypedContract } from 'eth-hooks/models';

import { appContractsConfig, TAppConnectorList} from '../configs/appContracts.config';

export const {
  ContractsAppContext,
  useAppContractsActions,
  useAppContracts,
  useLoadAppContracts,
  useConnectAppContracts,
} = contractsContextFactory<
  /* the contractNames (keys) in config output */
  keyof TAppConnectorList,
  /* the type of the config output  */
  TAppConnectorList,
  /* A type that infers the value of each contractName: contract pair*/
  TTypedContract<keyof TAppConnectorList, TAppConnectorList>
>(appContractsConfig);