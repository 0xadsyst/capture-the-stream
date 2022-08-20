import btcLogo from 'src/assets/btc.png'
import ethLogo from 'src/assets/eth.png'
import maticLogo from 'src/assets/matic.png'

interface Props {
    asset: string
}

export const AssetLogo = (props: Props) => {
    let image = ethLogo
    props.asset == 'BTC' ? image = btcLogo : image = image
    props.asset == 'ETH' ? image = ethLogo : image = image
    props.asset == 'MATIC' ? image = maticLogo : image = image

    return <></>
  // return <><img src={image} alt={''} width="40px" height="40px" ></img></>
} 