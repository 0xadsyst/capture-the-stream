// ** Icon imports
import HomeOutline from 'mdi-material-ui/HomeOutline'
import AccountCogOutline from 'mdi-material-ui/AccountCogOutline'

// ** Type import
import { VerticalNavItemsType } from 'src/layouts/types'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'Summary',
      path: '/'
    },
    {
      title: 'Round',
      path: '/round'
    },
    {
      title: 'My History',
      path: '/underConstruction'
    },
    {
      title: 'Protocol Statistics',
      path: '/underConstruction'
    }
  ]
}

export default navigation
