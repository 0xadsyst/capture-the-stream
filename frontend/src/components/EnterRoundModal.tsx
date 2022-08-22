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
import { RoundsContext } from 'src/context/roundsContext'
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

const EnterRoundModal = () => {
  const [open, setOpen] = useState(false)
  const [disabled, setDisabled] = useState(true)
  const [roundCost, setRoundCost] = useState(0)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const [guess, setGuess] = useState<string>('0')
  const balance = useProtocolBalance()
  const { data: signer } = useSigner()
  const { chain } = useNetwork()
  const roundContext = useContext(RoundContext)
  const roundsContext = useContext(RoundsContext)

  const handleEnterRoundClick = () => {
    if (roundContext?.roundId != null) {
      const enterRoundTx = enterRound(roundContext?.roundId, parseFloat(guess) * 1e8, signer, chain?.id ?? 31337)
      setOpen(false)
    }
  }

  useEffect(() => {
    if (roundContext?.roundId != null) {
      setRoundCost(roundsContext.rounds[roundContext.roundId].guessCost / 1e18)
    }
  }, [roundContext, roundsContext])

  useEffect(() => {
    if (roundContext?.roundId != null) {
      if (
        roundsContext.rounds[roundContext.roundId].guessCutOffTimestamp < dayjs().unix() ||
        roundCost > parseFloat(ethers.utils.formatUnits(balance, 18))
      ) {
        setDisabled(true)
      } else {
        setDisabled(false)
      }
    }
  }, [roundContext, roundsContext, balance, roundCost])

  return (
    <>
      <Button variant='contained' onClick={handleOpen} disabled={disabled}>
        ENTER ROUND
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
            Round Cost: {roundCost} DAI
          </Typography>

          <TextField
            label='Guess'
            id='guess'
            sx={{ m: 1, width: '25ch', mt: 4, mb: 2 }}
            InputProps={{
              endAdornment: <InputAdornment position='end'>USD</InputAdornment>
            }}
            value={guess}
            onChange={e => {
              setGuess(e.currentTarget.value)
            }}
            onFocus={e => e.target.select()}
          />

          <Button variant='contained' onClick={handleEnterRoundClick} disabled={disabled}>
            Enter Round
          </Button>
        </Box>
      </Modal>
    </>
  )
}

function enterRound(roundId: number | undefined, guess: number, signer: any, chain: number) {
  console.log('guess: ', guess)
  console.log('signer: ', signer)
  console.log('roundId: ', roundId)

  if (signer && roundId != undefined && chain) {
    const address = externalContractsAddressMap[chain]['CaptureTheStream']
    const captureTheStream = CaptureTheStream__factory.connect(address, signer)

    return captureTheStream.enterRound(roundId, guess)
  } else {
    return Promise.resolve(false)
  }
}

export default EnterRoundModal
