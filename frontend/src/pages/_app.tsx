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
import '../../styles/globals.css'

// ** Web3
import React, { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import initializeOnboard from 'src/utils/initializeOnboard'
import { ethers } from 'ethers'

import { RoundCtx } from 'src/context/roundContext'
import { RoundsCtx, RoundType } from 'src/context/roundsContext'
import { GuessesContext, GuessType } from 'src/context/guessesContext'
import { ProviderContext } from 'src/context/providerContext'
import { ApolloClient, InMemoryCache, NormalizedCacheObject } from '@apollo/client'
import { apolloClient } from 'src/utils/apollo-client'
import { ApolloProvider } from '@apollo/react-components'

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

initializeOnboard()

// ** Configure JSS & ClassName
const App = (props: ExtendedAppProps) => {
  const [round, setRound] = useState<number | undefined>()
  const [rounds, setRounds] = useState<RoundType[] | undefined>()
  const [guesses, setGuesses] = useState<GuessType[] | undefined>()
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | undefined>()
  const [apolloContextClient, setapolloContextClient] = useState<ApolloClient<NormalizedCacheObject>>(
    initialApolloClient
  )

  useEffect(() => {
    console.log('update apollo provider', provider)
    setapolloContextClient(apolloClient[provider?._network?.chainId ?? 31337])
  }, [provider?._network?.chainId])

  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props

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
          <ProviderContext.Provider value={{ provider: provider ?? undefined, setProvider: setProvider }}>
            <ApolloProvider client={apolloContextClient}>
                <RoundCtx.Provider value={{ roundId: round ?? 0, setRoundId: setRound }}>
                  <RoundsCtx.Provider value={{ rounds: rounds ?? [], setRounds: setRounds }}>
                    <GuessesContext.Provider value={{ guesses: guesses ?? [], setGuesses: setGuesses }}>
                      <SettingsConsumer>
                        {({ settings }) => {
                          return (
                            <ThemeComponent settings={settings}>
                              {getLayout(<Component {...pageProps} />)}
                            </ThemeComponent>
                          )
                        }}
                      </SettingsConsumer>
                    </GuessesContext.Provider>
                  </RoundsCtx.Provider>
                </RoundCtx.Provider>
            </ApolloProvider>
          </ProviderContext.Provider>
        </SettingsProvider>
      </QueryClientProvider>
    </CacheProvider>
  )
}

export default App
