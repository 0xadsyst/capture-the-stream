import { externalContractsAddressMap } from 'src/configs/externalContracts.config'

export const getAssetNameFromOracle = (oracleAddress: string, chainId: number | undefined) : string => {
    if (oracleAddress && chainId) {
    const addresses = externalContractsAddressMap[chainId]
    const result = Object.keys(addresses).find(key => addresses[key].toLowerCase() == oracleAddress.toLowerCase()) ?? ''
    
return result.replace("AggregatorV3Interface","")
    } else {
        return ''
    }
}