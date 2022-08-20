import React, { useState, useContext } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'
import Grid from '@mui/material/Grid'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormHelperText from '@mui/material/FormHelperText'

import { TextField } from '@mui/material'

import { externalContractsAddressMap } from '../configs/externalContracts.config'
import { ethers } from 'ethers'
import { RoundContext } from '../context/roundContext'
import { MockChainlinkAggregator__factory } from '../../generated/factories/MockChainlinkAggregator__factory'
import { useContractRead, useNetwork, useProvider, useSigner, usePrepareSendTransaction } from 'wagmi'

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
  const provider  = useProvider()
  const roundContext = useContext(RoundContext)
  const { chain } = useNetwork()
  const { data: signer} = useSigner()

  const handleInputChange = (e: any) => {
    const { name, value } = e.target
    setFormValues({
      ...formValues,
      [name]: value
    })
  }

  const handleSubmit = () => {
    console.log('formValues: ', formValues)
    if (provider) {
      const txValues: TransactionValues = {
        oracle:
          externalContractsAddressMap[chain?.id ?? 0][
            'AggregatorV3Interface' + formValues.oracle
          ],
        newPrice: parseFloat(formValues.newPrice) * 1e8
      }
      const updateOracleTx = updateOracle(txValues, signer)
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

function updateOracle(txValues: TransactionValues, signer: any) {
  if (signer) {
    const aggregatorContract = MockChainlinkAggregator__factory.connect(txValues.oracle, signer)
    
return aggregatorContract.updateAnswer(txValues.newPrice)
  } else {
    return Promise.resolve(false)
  }
}

export default UpdateOracleModal
