// ** Next Imports
import Head from 'next/head'
import { Router } from 'next/router'
import type { NextPage } from 'next'
import type { AppProps } from 'next/app'

// ** Loader Import
import NProgress from 'nprogress'

// ** Emotion Imports
import { CacheProvider } from '@emotion/react'
import type { EmotionCache } from '@emotion/cache'

// ** Config Imports
import themeConfig from 'src/configs/themeConfig'

// ** Component Imports
import UserLayout from 'src/layouts/UserLayout'
import ThemeComponent from 'src/theme/ThemeComponent'

// ** Contexts
import { SettingsConsumer, SettingsProvider } from 'src/context/settingsContext'

// ** Utils Imports
import { createEmotionCache } from 'src/utils/create-emotion-cache'

// ** React Perfect Scrollbar Style
import 'react-perfect-scrollbar/dist/css/styles.css'

// ** Global css styles
import 'styles/globals.css'

// ** Web3
import React, { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ethers } from 'ethers'

import { RoundContext } from 'src/context/roundContext'
import { SubgraphDataContext, SubgraphDataContextInterface, RoundType, GuessType, PowerUpType} from 'src/context/subgraphDataContext'
import { ApolloClient, InMemoryCache, NormalizedCacheObject } from '@apollo/client'
import { apolloClient } from 'src/utils/apollo-client'
import { ApolloProvider } from '@apollo/react-components'
import { SUPPORTED_CHAINS } from 'src/constants/chains'

const queryClient = new QueryClient()

export const initialApolloClient = new ApolloClient({
  uri: 'http://localhost:8000/subgraphs/name/capture-the-stream/capture-the-stream',
  cache: new InMemoryCache()
})

// ** Extend App Props with Emotion
type ExtendedAppProps = AppProps & {
  Component: NextPage
  emotionCache: EmotionCache
}

const clientSideEmotionCache = createEmotionCache()

// ** Pace Loader
if (themeConfig.routingLoader) {
  Router.events.on('routeChangeStart', () => {
    NProgress.start()
  })
  Router.events.on('routeChangeError', () => {
    NProgress.done()
  })
  Router.events.on('routeChangeComplete', () => {
    NProgress.done()
  })
}

import '@rainbow-me/rainbowkit/styles.css'
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { chain, configureChains, createClient, WagmiConfig, useNetwork } from 'wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'

const { chains, provider } = configureChains(
  [chain.polygonMumbai, chain.hardhat],
  [alchemyProvider({ apiKey: process.env.ALCHEMY_ID }), publicProvider()]
)

const { connectors } = getDefaultWallets({
  appName: 'Capture the Stream',
  chains
})

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})

const App = (props: ExtendedAppProps) => {
  const [round, setRound] = useState<number | undefined>()
  const [rounds, setRounds] = useState<RoundType[] | undefined>()
  const [guesses, setGuesses] = useState<GuessType[] | undefined>()
  const [powerUps, setPowerUps] = useState<PowerUpType[] | undefined>()
  const [apolloContextClient, setapolloContextClient] =
    useState<ApolloClient<NormalizedCacheObject>>(initialApolloClient)
  const { chain } = useNetwork()

  useEffect(() => {
    if (SUPPORTED_CHAINS.includes(chain?.id ?? 0)) {
      setapolloContextClient(apolloClient[chain?.id ?? 31337])
    }
  }, [chain?.id])
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props

  const subgraphDataContextValue: SubgraphDataContextInterface = {
    rounds: rounds ?? [],
    setRounds: setRounds,
    guesses: guesses ?? [],
    setGuesses: setGuesses,
    powerUps: powerUps ?? [],
    setPowerUps: setPowerUps
  }

  // Variables
  const getLayout = Component.getLayout ?? (page => <UserLayout>{page}</UserLayout>)

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>{'Capture the Stream'}</title>
        <meta name='description' content={'Capture the Stream'} />
        <meta name='viewport' content='initial-scale=1, width=device-width' />
      </Head>
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <WagmiConfig client={wagmiClient}>
            <RainbowKitProvider chains={chains}>
              <ApolloProvider client={apolloContextClient}>
                <RoundContext.Provider value={{ roundId: round ?? null, setRoundId: setRound }}>
                  <SubgraphDataContext.Provider value={subgraphDataContextValue}>
                      <SettingsConsumer>
                        {({ settings }) => {
                          return (
                            <ThemeComponent settings={settings}>
                              {getLayout(<Component {...pageProps} />)}
                            </ThemeComponent>
                          )
                        }}
                      </SettingsConsumer>
                  </SubgraphDataContext.Provider>
                </RoundContext.Provider>
              </ApolloProvider>
            </RainbowKitProvider>
          </WagmiConfig>
        </SettingsProvider>
      </QueryClientProvider>
    </CacheProvider>
  )
}

export default App
