import React, { useState, useContext, useEffect } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'

import useProtocolBalance from 'src/hooks/useProtocolBalance'
import { InputAdornment, TextField } from '@mui/material'

import { externalContractsAddressMap } from 'src/configs/externalContracts.config'
import { CaptureTheStream__factory } from 'generated/factories/CaptureTheStream__factory'
import { useNetwork, useSigner } from 'wagmi'
import { ethers, BigNumber } from 'ethers'
import { RoundContext } from 'src/context/roundContext'
import { SubgraphDataContext } from 'src/context/subgraphDataContext'
import dayjs from 'dayjs'

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4
}

const GetPowerUpModal = () => {
  const [open, setOpen] = useState(false)
  const [disabled, setDisabled] = useState(true)
  const [cost, setCost] = useState(0)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const balance = useProtocolBalance()
  const { data: signer } = useSigner()
  const { chain } = useNetwork()
  const roundContext = useContext(RoundContext)
  const subgraphDataContext = useContext(SubgraphDataContext)

  const handleClick = () => {
    if (roundContext?.roundId != null) {
      const tx = getPowerUp(roundContext?.roundId, signer, chain?.id ?? 31337)
      setOpen(false)
    }
  }

  useEffect(() => {
    if (roundContext?.roundId != null) {
      setCost(subgraphDataContext.rounds[roundContext.roundId].guessCost / (2 * 1e18))
    }
  }, [roundContext, subgraphDataContext])

  useEffect(() => {
    if (roundContext?.roundId != null) {
      if (cost > parseFloat(ethers.utils.formatUnits(balance, 18))) {
        setDisabled(true)
      } else {
        setDisabled(false)
      }
    }
  }, [roundContext, subgraphDataContext, balance, cost])

  return (
    <>
      <Button variant='contained' onClick={handleOpen} disabled={disabled}>
        GET POWER UP
      </Button>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <Box sx={style}>
          <Typography id='modal-modal-title' variant='h6' component='h2'>
            Round: {roundContext?.roundId}
          </Typography>
          <Typography id='modal-modal-title' variant='h6' component='h2'>
            Current Balance: {parseFloat(ethers.utils.formatUnits(balance, 18)).toFixed(2).toString()} DAI
          </Typography>
          <Typography id='modal-modal-title' variant='h6' component='h2'>
            Power Up Cost: {cost} DAI
          </Typography>
          <Button variant='contained' onClick={handleClick} disabled={disabled}>
            Get Power Up
          </Button>
        </Box>
      </Modal>
    </>
  )
}

function getPowerUp(roundId: number | undefined, signer: any, chain: number) {
  if (signer && roundId != undefined && chain) {
    const address = externalContractsAddressMap[chain]['CaptureTheStream']
    const captureTheStream = CaptureTheStream__factory.connect(address, signer)

    return captureTheStream.getPowerUp(roundId)
  } else {
    return Promise.resolve(false)
  }
}

export default GetPowerUpModal
