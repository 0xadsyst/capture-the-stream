import Button from '@mui/material/Button'
import { MockDAI__factory } from 'generated/factories/MockDAI__factory'
import { externalContractsAddressMap } from 'src/configs/externalContracts.config'
import { ethers, BigNumber } from 'ethers'

interface Props {
  signer: any
  chain: number
}

const MintDAI = (props: Props) => {
  const handleMintDAIClick = () => mintDAI(props.signer, props.chain)

  return (
    <Button variant='contained' onClick={handleMintDAIClick}>
      Mint Test DAI
    </Button>
  )
}

async function mintDAI(signer: any, chain: number) {
  if (signer) {
    const address = externalContractsAddressMap[chain]['MockDAI']
    const myAddress = signer._address
    const daiContract = MockDAI__factory.connect(address, signer)
    const amount = ethers.utils.parseUnits('1000', 18)

    return daiContract.mint(myAddress, amount)
  } else {
    return Promise.resolve(false)
  }
}

export default MintDAI
