import { init } from '@web3-onboard/react'
import injectedModule from '@web3-onboard/injected-wallets'

export default function initializeOnboard() {
  const INFURA_ID = process.env.NEXT_PUBLIC_INFURA_ID;
  const rpcUrl = `https://mainnet.infura.io/v3/${INFURA_ID}`
  const injected = injectedModule()
  // initialize Onboard
  init({
    wallets: [injected],
    chains: [
      {
        id: '0x13881',
        token: 'MATIC',
        label: 'Polygon Mumbai',
        rpcUrl
      },
      {
        id: '0x7A69',
        token: 'ETH',
        label: 'Localhost',
        rpcUrl: '127.0.0.1:8545'
      }
    ]
  })
}
