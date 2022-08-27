import { DeployFunction } from 'hardhat-deploy/types';
import { THardhatRuntimeEnvironmentExtended } from 'helpers/types/THardhatRuntimeEnvironmentExtended';
import { config as envConfig } from 'dotenv';
envConfig({ path: '../../.env' });
const ehre = require('hardhat');

const ethernal = require('hardhat-ethernal');

const func: DeployFunction = async (hre: THardhatRuntimeEnvironmentExtended) => {
  if (process.env.HARDHAT_TARGET_NETWORK == 'localhost') {
    const { getNamedAccounts, deployments } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const mockChainlinkAggregatorETH = await deploy('MockChainlinkAggregatorETH', {
      from: deployer,
      args: [18, 0],
      log: true,
    });
    const mockChainlinkAggregatorBTC = await deploy('MockChainlinkAggregatorBTC', {
      from: deployer,
      args: [18, 0],
      log: true,
    });
    const mockChainlinkAggregatorMATIC = await deploy('MockChainlinkAggregatorMATIC', {
      from: deployer,
      args: [18, 0],
      log: true,
    });

    // await ehre.ethernal.push({
    //   name: 'MockChainlinkAggregatorETH',
    //   address: mockChainlinkAggregatorETH.address,
    // });
    // await ehre.ethernal.push({
    //   name: 'MockChainlinkAggregatorBTC',
    //   address: mockChainlinkAggregatorBTC.address,
    // });
    // await ehre.ethernal.push({
    //   name: 'MockChainlinkAggregatorMATIC',
    //   address: mockChainlinkAggregatorMATIC.address,
    // });
  }
};
export default func;
func.tags = ['MockChainlinkAggregatorETH', 'MockChainlinkAggregatorBTC', 'MockChainlinkAggregatorMATIC'];

/*
Tenderly verification
let verification = await tenderly.verify({
  name: contractName,
  address: contractAddress,
  network: targetNetwork,
});
*/
