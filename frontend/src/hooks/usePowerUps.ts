import { useEffect, useState } from 'react'

// ** Web3
import { useQuery } from '@apollo/client'
import { POWERUP_QUERY } from 'src/constants/queries/queries'
import { useContext } from 'react'
import { SubgraphDataContext, PowerUpType } from 'src/context/subgraphDataContext'

interface PowerUpDataType {
  __typename: string
  id: string
  user: string
  roundId: string
  status: string
  typeOf: string
  length: string
  endTime: string
  selectableTarget: string
  target: string
}

const usePowerUps = () => {
  const [queryData, setQueryData] = useState<PowerUpDataType[]>()
  const [powerUpList, setPowerUpList] = useState<PowerUpType[]>([])

  const subgraphDataContext = useContext(SubgraphDataContext)

  const { loading, error, data } = useQuery(POWERUP_QUERY, {
    pollInterval: 5000
  })

  useEffect(() => {
    if (data) {
      setQueryData(data.powerUps)
    }
  }, [data, loading])

  useEffect(() => {
    const powerUpList: PowerUpType[] = []
    if (queryData) {
      queryData.map(data =>
        powerUpList.push({
          id: data['id'],
          user: data['user'],
          roundId: parseInt(data['roundId']),
          status: data['status'],
          typeOf: data['typeOf'],
          length: parseInt(data['length']),
          endTime: parseInt(data['endTime']),
          selectableTarget: Boolean(data['selectableTarget']),
          target: parseInt(data['target']),
        })
      )
    }
    setPowerUpList(powerUpList)
    subgraphDataContext?.setPowerUps(powerUpList)
  }, [queryData])

  return powerUpList
}

export default usePowerUps
