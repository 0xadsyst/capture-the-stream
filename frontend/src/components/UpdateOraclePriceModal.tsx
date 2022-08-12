import React, { useState, useContext } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'
import Grid from '@mui/material/Grid'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Switch from '@mui/material/Switch'
import FormHelperText from '@mui/material/FormHelperText'

import { InputAdornment, TextField } from '@mui/material'

import { externalContractsAddressMap } from 'src/configs/externalContracts.config'
import { CaptureTheStream__factory } from '../../generated/factories/CaptureTheStream__factory'
import { ProviderContext } from 'src/context/providerContext'
import { ethers } from 'ethers'
import { RoundCtx } from 'src/context/roundContext'
import moment from 'moment'
import { MockChainlinkAggregator__factory } from 'generated/factories/MockChainlinkAggregator__factory'

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4
}

interface Form {
  oracle: string
  newPrice: string
}

interface TransactionValues {
  oracle: string
  newPrice: number
}

const defaultValues: Form = {
  oracle: 'ETH',
  newPrice: '0'
}

const UpdateOracleModal = () => {
  const [open, setOpen] = useState(false)
  const [formValues, setFormValues] = useState<Form>(defaultValues)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const providerContext = useContext(ProviderContext)
  const roundContext = useContext(RoundCtx)

  const handleInputChange = (e: any) => {
    const { name, value } = e.target
    setFormValues({
      ...formValues,
      [name]: value
    })
  }

  const handleSubmit = () => {
    console.log('formValues: ', formValues)
    if (providerContext.provider) {
      const txValues: TransactionValues = {
        oracle:
          externalContractsAddressMap[providerContext.provider.network.chainId][
            'AggregatorV3Interface' + formValues.oracle
          ],
        newPrice: parseInt(formValues.newPrice) * 1e8
      }
      const updateOracleTx = updateOracle(txValues, providerContext.provider)
    } else {
      console.log('No provider')
    }
  }

  return (
    <>
      <Button variant='contained' onClick={handleOpen}>
        UPDATE ORACLE
      </Button>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <Box sx={style}>
          <Typography id='modal-modal-title' variant='h6' component='h2'>
            Update Oracle
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={12} mt={4}>
              <Select
                name='oracle'
                id='oracle'
                value={formValues?.oracle}
                label='Asset'
                onChange={handleInputChange}
                sx={{ width: 250 }}
              >
                <MenuItem value={'ETH'}>ETH</MenuItem>
                <MenuItem value={'BTC'}>BTC</MenuItem>
                <MenuItem value={'MATIC'}>MATIC</MenuItem>
              </Select>
              <FormHelperText>Asset</FormHelperText>
            </Grid>
            <Grid item xs={12} md={12} mb={4}>
              <TextField
                label='New Price'
                id='newPrice'
                name='newPrice'
                sx={{ width: 250 }}
                value={formValues?.newPrice}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>

          <Button variant='contained' onClick={handleSubmit}>
            Update Oracle
          </Button>
        </Box>
      </Modal>
    </>
  )
}

function updateOracle(txValues: TransactionValues, provider: ethers.providers.Web3Provider | undefined) {
  console.log('provider: ', provider)

  if (provider) {
    const aggregatorContract = MockChainlinkAggregator__factory.connect(txValues.oracle, provider.getSigner())
    return aggregatorContract.updateAnswer(txValues.newPrice)
  } else {
    return Promise.resolve(false)
  }
}

export default UpdateOracleModal
