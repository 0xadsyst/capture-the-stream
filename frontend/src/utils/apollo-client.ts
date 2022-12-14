import { ApolloClient, InMemoryCache, NormalizedCacheObject } from '@apollo/client'

const apolloClientLocalhost = new ApolloClient({
  uri: 'http://localhost:8000/subgraphs/name/capture-the-stream/capture-the-stream',
  cache: new InMemoryCache()
})

export const apolloClientMumbai = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/0xadsyst/cts-mumbai-cl-hackathon',
  cache: new InMemoryCache()
})

export const apolloClient: {
  [key: number]: ApolloClient<NormalizedCacheObject>
} = {
  31337: apolloClientLocalhost,
  80001: apolloClientMumbai
}
