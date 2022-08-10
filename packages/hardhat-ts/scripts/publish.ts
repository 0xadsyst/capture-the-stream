import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import fs from 'fs';
import path from 'path';

import chalk from 'chalk';

const deploymentsDir = './generated/deployments';
const frontEndDir = '../../frontend/generated';
const graphDir = '../advanced/subgraph';

const publishContract = (contractName: string, networkName: string): boolean => {
  try {
    const contract = fs.readFileSync(`${deploymentsDir}/${networkName}/${contractName}.json`).toString();
    const contractJson: { address: string; abi: [] } = JSON.parse(contract);

    const graphConfigPath = `${graphDir}/config/config.json`;
    let graphConfigStr = '{}';
    try {
      if (fs.existsSync(graphConfigPath)) {
        graphConfigStr = fs.readFileSync(graphConfigPath).toString() as any;
      }
    } catch (e) {
      console.log(e);
    }

    const graphConfig = JSON.parse(graphConfigStr);
    graphConfig[`${networkName}_${contractName}Address`] = contractJson.address;

    const folderPath = graphConfigPath.replace('/config.json', '');
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }

    fs.writeFileSync(graphConfigPath, JSON.stringify(graphConfig, null, 2));
    if (!fs.existsSync(`${graphDir}/abis`)) fs.mkdirSync(`${graphDir}/abis`);
    fs.writeFileSync(`${graphDir}/abis/${networkName}_${contractName}.json`, JSON.stringify(contractJson.abi, null, 2));

    console.log(' 📠 Published ' + chalk.green(contractName) + ' to the frontend.');

    console.log('frontEndDir:', path.resolve(frontEndDir));

    if (!fs.existsSync(`${frontEndDir}/abis`)) fs.mkdirSync(`${frontEndDir}/abis`, { recursive: true });
    fs.writeFileSync(`${frontEndDir}/abis/${contractName}.json`, JSON.stringify(contractJson.abi, null, 2));

    return true;
  } catch (e) {
    console.log('Failed to publish ' + chalk.red(contractName) + ' to the subgraph.');
    console.log(e);
    return false;
  }
};

// eslint-disable-next-line @typescript-eslint/require-await
export async function main(): Promise<void> {
  const deploymentSubdirs = fs.readdirSync(deploymentsDir);
  deploymentSubdirs.forEach(function (directory) {
    const files = fs.readdirSync(`${deploymentsDir}/${directory}`);
    files.forEach(function (file) {
      if (file.includes('.json')) {
        const contractName = file.replace('.json', '');
        publishContract(contractName, directory);
      }
    });
  });
  console.log('?  Published contracts to the subgraph package.');
}

main().catch(console.error);
