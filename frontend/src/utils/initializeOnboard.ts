import { init } from '@web3-onboard/react'
import injectedModule from '@web3-onboard/injected-wallets'

export default function initializeOnboard() {
  const infuraKey = '58c2341ec5b54691b7de91bcb940b428'
  const rpcUrl = `https://mainnet.infura.io/v3/${infuraKey}`
  const injected = injectedModule()
  // initialize Onboard
  init({
    wallets: [injected],
    chains: [
      {
        id: '0x1',
        token: 'ETH',
        label: 'Ethereum Mainnet',
        rpcUrl
      },
      {
        id: '0xA4B1',
        token: 'ETH',
        label: 'Arbitrum Mainnet',
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
