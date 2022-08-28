import React, { useState, useContext, useEffect } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'
import { FormControl } from '@mui/material'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormHelperText from '@mui/material/FormHelperText'
import FormLabel from '@mui/material/FormLabel'
import { InputAdornment, TextField } from '@mui/material'

import { externalContractsAddressMap } from 'src/configs/externalContracts.config'
import { CaptureTheStream__factory } from 'generated/factories/CaptureTheStream__factory'
import { useNetwork, useSigner, useAccount } from 'wagmi'
import { RoundContext } from 'src/context/roundContext'
import { SubgraphDataContext, RoundType, GuessType, PowerUpType } from 'src/context/subgraphDataContext'
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

interface RowType {
  id: string
  user: string
  status: string
  typeOf: string
  endTime: string
  target: string
}

const guessesDefault: GuessType[] = []

const UsePowerUpModal = () => {
  const [open, setOpen] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const { data: signer } = useSigner()
  const { chain } = useNetwork()
  const roundContext = useContext(RoundContext)
  const subgraphDataContext = useContext(SubgraphDataContext)
  const [guesses, setGuesses] = useState<GuessType[]>(guessesDefault)
  const [powerUps, setPowerUps] = useState<any[] | null>()
  const [roundData, setRoundData] = useState<RoundType>()
  const [guess, setGuess] = useState('0')
  const [selectedPowerUp, setSelectedPowerUp] = useState<string>('')
  const [selectedTarget, setSelectedTarget] = useState<string>('0')
  const [guessFormVisible, setGuessFormVisible] = useState(false)
  const [targetFormVisible, setTargetFormVisible] = useState(false)
  const [myAddress, setMyAddress] = useState('')
  const { address } = useAccount()

  useEffect(() => {
    address ? setMyAddress(address) : null
  }, [address])

  useEffect(() => {
    const guessesData = [...subgraphDataContext.guesses].filter(g => {
      return g.roundId == roundContext?.roundId
    })
    setGuesses(guessesData)
    if (roundContext?.roundId) {
      setRoundData(subgraphDataContext.rounds[roundContext.roundId])
    }
  }, [subgraphDataContext.guesses, roundContext?.roundId])


  useEffect(() => {
    const powerUpType: any = {
      DISABLE_GUESS: 'Disable Guess',
      TAKEOVER_GUESS: 'Takeover Guess',
      FREE_GUESS: 'Free Guess'
    }
    if (roundContext?.roundId != null) {
      const round = subgraphDataContext.rounds[roundContext.roundId]
      const powerUpsData = [...subgraphDataContext.powerUps].filter(p => {
        return (p.roundId == roundContext.roundId &&
          p.user.toLowerCase() == myAddress?.toLowerCase() && 
          p.status == 'READY')
      })

      powerUpsData.length > 0 ? setDisabled(false) : setDisabled(true)
      const powerUpItems = powerUpsData.map(p => {
        const menuText = p.id.substring(p.id.length - 5, p.id.length - 1) + ' - ' + powerUpType[p.typeOf]
        const endTime = dayjs(
          (dayjs().unix() + (round.endTimestamp - dayjs().unix()) * (p.length / 100)) * 1000
        ).format('MMM D h:mma')
        let target = 'To be selected'
        if (!p.selectableTarget && guesses) {
          const targetGuess = [...guesses].find(g => {
            return g.guessId == p.target
          })
          target = '$' + (targetGuess?.guess ?? '') + ' (' + targetGuess?.user.substring(0, 6) + ')'
        }

        const helperText1 = 'End time: ' + endTime
        const helperText2 = 'Target: ' + target
        const showHelperText = p.typeOf == 'FREE_GUESS' ? false : true
        return (
          <div key={p.id} >
            <FormControlLabel key={p.id} value={p.id} control={<Radio />} label={menuText} />
            <FormHelperText key={p.id + 'a'}>{showHelperText && helperText1}</FormHelperText>
            <FormHelperText key={p.id + 'b'}>{showHelperText && helperText2}</FormHelperText>
          </div>
        )
      })
      console.log('powerUpItems', powerUpItems)
      setPowerUps(powerUpItems)
    }
  }, [roundContext?.roundId, subgraphDataContext.powerUps, roundData, myAddress])

  const handleClick = () => {
    if (roundContext?.roundId != null) {
      const tx = doUsePowerUp(
        selectedPowerUp,
        parseInt(selectedTarget),
        parseInt(guess) * 1e8,
        signer,
        chain?.id ?? 31337
      )
      setOpen(false)
    }
  }

  const handlePowerUpChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const powerUp = [...subgraphDataContext.powerUps].find(p => {
      return p.id == event.target.value
    })
    setSelectedPowerUp(event.target.value)

    if (powerUp) {
      (powerUp.typeOf == 'FREE_GUESS') ? setGuessFormVisible(true) : setGuessFormVisible(false);
      (powerUp.selectableTarget && !(powerUp.typeOf == 'FREE_GUESS')) ? setTargetFormVisible(true) : setTargetFormVisible(false)
    }
  }

  const guessItems = guesses.map(guess => {
    return (
      <MenuItem value={guess.guessId} key={guess.guessId}>
        {'$' + guess.guess + ' (' + guess.user.substring(0, 7) + ')'}
      </MenuItem>
    )
  })
  const targetForm = (
    <FormControl fullWidth>
      <InputLabel id='guess-select-label'>Guess</InputLabel>
      <Select
        labelId='guess-label'
        id='guess-select'
        sx={{ width: '25ch' }}
        value={selectedTarget}
        label='Guess'
        onChange={event => {
          setSelectedTarget(event.target.value)
        }}
      >
        {guessItems}
      </Select>
    </FormControl>
  )

  const guessForm = (
    <TextField
      label='Guess'
      id='guess'
      sx={{ width: '25ch', mt: 4, mb: 2 }}
      InputProps={{
        endAdornment: <InputAdornment position='end'>USD</InputAdornment>
      }}
      value={guess}
      onChange={e => {
        setGuess(e.currentTarget.value)
      }}
      onFocus={e => e.target.select()}
    />
  )

  return (
    <>
      <Button variant='contained' onClick={handleOpen} disabled={disabled}>
        USE POWER UP
      </Button>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <Box sx={style}>
          <FormControl fullWidth>
            <FormLabel id='select-power-up'>Power Up</FormLabel>
            <RadioGroup
              aria-labelledby='power-up-radio-buttons'
              defaultValue='female'
              name='power-up-radio-buttons'
              onChange={handlePowerUpChange}
            >
              {powerUps}
            </RadioGroup>
          </FormControl>
          {guessFormVisible && guessForm}
          {targetFormVisible && targetForm}
          <Button variant='contained' onClick={handleClick} disabled={disabled} sx={{ m: 1, mt: 4, mb: 2 }}>
            Use Power Up
          </Button>
        </Box>
      </Modal>
    </>
  )
}

function doUsePowerUp(powerUpId: string, target: number, guess: number, signer: any, chain: number) {
  if (signer && chain) {
    console.log(powerUpId, target, guess, signer, chain)
    const address = externalContractsAddressMap[chain]['CaptureTheStream']
    const captureTheStream = CaptureTheStream__factory.connect(address, signer)

    return captureTheStream.usePowerUp(powerUpId, target, guess)
  } else {
    return Promise.resolve(false)
  }
}

export default UsePowerUpModal
