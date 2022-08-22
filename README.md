# Capture the Stream
## Overview
Capture the stream is a decentralized crypto price prediction game. Players guess the price of an asset during a defined time period and if their guess is the closest, they capture the stream of tokens from the other players. It makes use of Chainlink keepers to manage the round winners automatically, without human interaction. After each block, the Chainlink keeper checks the contract to see if the asset price has changed into the range of another guess. If there is a new winner, the keeper will initiate an update of the stream through the smart contract.

## Installation

```bash
yarn
```


## Build and Deploy
Before you start, setup the environment you want to deploy to in the .env file. The only supported deployments currently are localhost and mumbai. Also in this file is an address that the deployment script uses to set as the new owner of the main contract, if you don't change this, you'll need to manually set the ownership through the deployed contract.

1. Generate account for deployment (note that there will be an error the first time you run this, but this can be ignored).
```
yarn generate
```
2. Test contracts.
```
yarn test
```
   
3. Build and deploy contracts.
``` 
yarn contracts:build
yarn deploy
```
4. (REQUIRED FOR LOCAL DEPLOYMENT ONLY) Start the local chain and graph node (note that you'll need Docker installed to run the graph node).
```
yarn chain
yarn run-graph-node
```
5. Build and deploy the subgraph, use local/mumbai depending on where you're deploying. Note that if you are deploying to a public chain, you'll need to enter your subgraph account/subgraph name in the deploy script in `packages/advanced/subgraph/package.json`.
```
yarn subgraph-build-deploy-local
yarn subgraph-build-deploy-mumbai
```
6. (REQUIRED FOR LOCAL DEPLOYMENT ONLY) Start the scaffold-eth frontend, this is only required if you want to use the faucet built in for the local chain.
```
yarn start:nextjs
```
7. Edit the contract addresses for the frontend in `src/configs/externalContracts.config.ts` (this will eventually be automated through the deploy scripts).
8. Start the frontend.
```
yarn start
```

## After deployment
Once the contracts are deployed, the test page can be used to perform some additional administration tasks that are required for local testing.
1. Set deposit asset: This button will set the address of the token that can be deposited into the contract. This uses the MockDAI address from `src/configs/externalContracts.config.ts`. Alternatively the owner of the contract can set this directly through the contract. Note that this function will be removed in a deployment to a non-test blockchain.
2. Set oracle prices: This button allows you to set the oracle price for assets for testing purposes. This only works for locally deployed mock Chainlink aggregators.
3. Perform upkeep: This performs the function that the Chainlink keeper normally does, checking if upkeep is required, and using the data supplied by the contract to request upkeeep. Note that many of the contract functions depend on block timestamps, if you are seeing unexpected results, check the local blockchain timestamps are accurate.
4. Minting the deposit asset: Currently, both the localhost and Mumbai deployments use a mock ERC20 as the deposit asset. This token can be freely minted by anybody using the contract or through the deposit/withdraw modal. Note also that for simplicity during testing, the mock ERC20 contract has a hard coded 1000 token approval.