/* eslint-disable unused-imports/no-unused-vars-ts */

import { GenericContract } from 'eth-components/ant/generic-contract';
import {
  useContractReader,
  useBalance,
  useEthersAdaptorFromProviderOrSigners,
  useEventListener,
  useGasPrice,
} from 'eth-hooks';
import { useEthersAppContext } from 'eth-hooks/context';
import { useDexEthPrice } from 'eth-hooks/dapps';
import { asEthersAdaptor } from 'eth-hooks/functions';
import { EthComponentsSettingsContext } from 'eth-components/models';

import Head from 'next/head';
import React, { FC, ReactElement, useContext } from 'react';

import { MainPageFooter, MainPageHeader, createTabsAndPages, TContractPageList } from '.';

import { useLoadAppContracts, useConnectAppContracts, useAppContracts } from '~common/components/context';
import { useCreateAntNotificationHolder } from '~common/components/hooks/useAntNotification';
import { useBurnerFallback } from '~common/components/hooks/useBurnerFallback';
import { useScaffoldAppProviders } from '~common/components/hooks/useScaffoldAppProviders';
import { NETWORKS } from '~common/constants';
import { getNetworkInfo } from '~common/functions';

import { useScaffoldHooksExamples } from '~~/components/hooks/useScaffoldHooksExamples';
import {
  BURNER_FALLBACK_ENABLED,
  CONNECT_TO_BURNER_AUTOMATICALLY,
  INFURA_ID,
  LOCAL_PROVIDER,
  MAINNET_PROVIDER,
  TARGET_NETWORK_INFO,
} from '~~/config/app.config';

/** ********************************
 * ⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️
 * See ./config/app.config.ts for configuration, such as TARGET_NETWORK
 * See ../common/src/config/appContracts.config.ts and ../common/src/config/externalContracts.config.ts to configure your contracts
 * See pageList variable below to configure your pages
 * See ../common/src/config/web3Modal.config.ts to configure the web3 modal
 * ⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️
 * ******************************** */

interface IMainPageProps {
  pageName: string;
  children?: ReactElement;
}

/**
 * The main component
 * @returns
 */
export const MainPage: FC<IMainPageProps> = (props) => {
  const notificationHolder = useCreateAntNotificationHolder();

  // -----------------------------
  // Providers, signers & wallets
  // -----------------------------
  // 🛰 providers
  // see useLoadProviders.ts for everything to do with loading the right providers
  const scaffoldAppProviders = useScaffoldAppProviders({
    targetNetwork: TARGET_NETWORK_INFO,
    connectToBurnerAutomatically: CONNECT_TO_BURNER_AUTOMATICALLY,
    localProvider: LOCAL_PROVIDER,
    mainnetProvider: MAINNET_PROVIDER,
    infuraId: INFURA_ID,
  });

  // 🦊 Get your web3 ethers context from current providers
  const ethersAppContext = useEthersAppContext();

  // if no user is found use a burner wallet on localhost as fallback if enabled
  useBurnerFallback(scaffoldAppProviders, BURNER_FALLBACK_ENABLED);

  // -----------------------------
  // Load Contracts
  // -----------------------------
  // 🛻 load contracts
  useLoadAppContracts();
  // 🏭 connect to contracts for mainnet network & signer
  const [mainnetAdaptor] = useEthersAdaptorFromProviderOrSigners(MAINNET_PROVIDER);
  useConnectAppContracts(mainnetAdaptor);
  // 🏭 connec to  contracts for current network & signer
  useConnectAppContracts(asEthersAdaptor(ethersAppContext));

  // -----------------------------
  // Hooks use and examples
  // -----------------------------
  // 🎉 Console logs & More hook examples:
  // 🚦 disable this hook to stop console logs
  // 🏹🏹🏹 go here to see how to use hooks!
  useScaffoldHooksExamples(scaffoldAppProviders);

  // -----------------------------
  // These are the contracts!
  // -----------------------------

  // init contracts
  const captureTheStream = useAppContracts('CaptureTheStream', ethersAppContext.chainId);
  const mockChainlinkAggregatorETH = useAppContracts('MockChainlinkAggregatorETH', ethersAppContext.chainId);
  const mockChainlinkAggregatorBTC = useAppContracts('MockChainlinkAggregatorBTC', ethersAppContext.chainId);
  const mockChainlinkAggregatorMATIC = useAppContracts('MockChainlinkAggregatorMATIC', ethersAppContext.chainId);
  const mockDAI = useAppContracts('MockDAI', ethersAppContext.chainId);

  // -----------------------------
  // .... 🎇 End of examples
  // -----------------------------
  // 💵 This hook will get the price of ETH from 🦄 Uniswap:
  const [ethPrice] = useDexEthPrice(
    scaffoldAppProviders.mainnetAdaptor?.provider,
    ethersAppContext.chainId !== 1 ? scaffoldAppProviders.targetNetwork : undefined
  );

  // 💰 this hook will get your balance
  const [yourCurrentBalance] = useBalance(ethersAppContext.account);

  const [gasPrice] = useGasPrice(ethersAppContext.chainId, 'fast', getNetworkInfo(ethersAppContext.chainId));
  const ethComponentsSettings = useContext(EthComponentsSettingsContext);

  // -----------------------------
  // 📃 App Page List
  // -----------------------------
  // This is the list of tabs and their contents
  const pageList: TContractPageList = {
    mainPage: {
      name: 'Capture The Stream',
      content: (
        <GenericContract
          contractName="CaptureTheStream"
          contract={captureTheStream}
          mainnetAdaptor={scaffoldAppProviders.mainnetAdaptor}
          blockExplorer={scaffoldAppProviders.targetNetwork.blockExplorer}
        />
      ),
    },
    pages: [
      {
        name: 'Mock-DAI',
        content: (
          <GenericContract
            contractName="MockDAI"
            contract={mockDAI}
            mainnetAdaptor={scaffoldAppProviders.mainnetAdaptor}
            blockExplorer={scaffoldAppProviders.targetNetwork.blockExplorer}
          />
        ),
      },
      {
        name: 'Mock-Chanlink-AggregatorETH',
        content: (
          <GenericContract
            contractName="MockChainlinkAggregatorETH"
            contract={mockChainlinkAggregatorETH}
            mainnetAdaptor={scaffoldAppProviders.mainnetAdaptor}
            blockExplorer={scaffoldAppProviders.targetNetwork.blockExplorer}
          />
        ),
      },
      {
        name: 'Mock-Chanlink-AggregatorBTC',
        content: (
          <GenericContract
            contractName="MockChainlinkAggregatorBTC"
            contract={mockChainlinkAggregatorBTC}
            mainnetAdaptor={scaffoldAppProviders.mainnetAdaptor}
            blockExplorer={scaffoldAppProviders.targetNetwork.blockExplorer}
          />
        ),
      },
      {
        name: 'Mock-Chanlink-AggregatorMATIC',
        content: (
          <GenericContract
            contractName="MockChainlinkAggregatorMATIC"
            contract={mockChainlinkAggregatorMATIC}
            mainnetAdaptor={scaffoldAppProviders.mainnetAdaptor}
            blockExplorer={scaffoldAppProviders.targetNetwork.blockExplorer}
          />
        ),
      },
    ],
  };
  const { tabMenu, pages } = createTabsAndPages(pageList);
  const RouteNotFound = <h3 className="p-10 mt-10 text-xl">Route Not Found </h3>;

  // -----------------------------
  // 📃 Render the react components
  // -----------------------------

  return (
    <div className="App">
      <Head>
        <title>Capture the Stream</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainPageHeader scaffoldAppProviders={scaffoldAppProviders} price={ethPrice} />
      {tabMenu}
      {pages[props.pageName] ?? RouteNotFound}
      <MainPageFooter scaffoldAppProviders={scaffoldAppProviders} price={ethPrice} />
      <div style={{ position: 'absolute' }}>{notificationHolder}</div>
    </div>
  );
};
