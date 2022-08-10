import { externalContractsAddressMap } from '../configs/externalContracts.config'
import { createConnectorForExternalContract, createConnectorForHardhatContract } from 'eth-hooks/context'
import { AggregatorV3Interface__factory, CaptureTheStream__factory } from '../../generated/factories/'

// a function that generates the config. Note that your types have to exist already!
export const appContractsConfig = () => {
  try {
    const result = {
      // 🙋🏽‍♂️ Add your external contracts here, make sure to define the address in `externalContractsConfig.ts`
      AggregatorV3Interface: createConnectorForExternalContract(
        'AggregatorV3Interface',
        AggregatorV3Interface__factory,
        externalContractsAddressMap
      ),
      CaptureTheStream: createConnectorForExternalContract(
        'CaptureTheStream',
        CaptureTheStream__factory,
        externalContractsAddressMap
      )
    } as const

    return result
  } catch (e) {
    console.error(
      '❌ contractConnectorConfig: ERROR with loading contracts please run `yarn contracts:build or yarn contracts:rebuild`.  Then run `yarn deploy`!',
      e
    )
  }

  return undefined
}

// create a type from the return value of the function above
export type TAppConnectorList = NonNullable<ReturnType<typeof appContractsConfig>>
