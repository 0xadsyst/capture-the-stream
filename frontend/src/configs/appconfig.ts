import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { TNetworkInfo, TEthersProvider } from 'eth-hooks/models';
import { NETWORKS } from '../constants/networks';
import { TNetworkNames } from '../models/TNetworkNames';


export const providerLocalhost = new StaticJsonRpcProvider('127.0.0.1:8545');

/**
 * Use burner wallet as fallback
 */
 export const BURNER_FALLBACK_ENABLED: boolean = process.env.NEXT_PUBLIC_BURNER_FALLBACK_ALLOWED === 'true';
 /**
  * Connect to burner on first load if there are no cached providers
  */
 export const CONNECT_TO_BURNER_AUTOMATICALLY =
   process.env.NEXT_PUBLIC_CONNECT_TO_BURNER_AUTOMATICALLY === 'true';

export const INFURA_ID: string = process.env.NEXT_PUBLIC_KEY_INFURA ?? '';
const targetNetwork: TNetworkNames = process.env.NEXT_PUBLIC_TARGET_NETWORK as TNetworkNames;

export const TARGET_NETWORK_INFO: TNetworkInfo = NETWORKS[targetNetwork];

const localhost: TNetworkInfo = NETWORKS.localhost;
export const LOCAL_PROVIDER: TEthersProvider | undefined =
  TARGET_NETWORK_INFO === localhost ? new StaticJsonRpcProvider(localhost.url) : undefined;

  export const MAINNET_PROVIDER = new StaticJsonRpcProvider(process.env.NEXT_PUBLIC_RPC_MAINNET);

  