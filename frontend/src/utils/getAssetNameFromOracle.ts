import { externalContractsAddressMap } from 'src/configs/externalContracts.config'

export const getAssetNameFromOracle = (oracleAddress: string, chainId: number | undefined) : string => {
    if (oracleAddress && chainId) {
        let result = ''
        try {
            const addresses = externalContractsAddressMap[chainId]
            result = Object.keys(addresses).find(key => addresses[key].toLowerCase() == oracleAddress.toLowerCase()) ?? ''
        } catch (error) {
            console.log(error)
        }

    
return result.replace("AggregatorV3Interface","")
    } else {
        return ''
    }
}