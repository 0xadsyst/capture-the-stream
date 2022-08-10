// ** Icon imports
import HomeOutline from 'mdi-material-ui/HomeOutline'
import AccountCogOutline from 'mdi-material-ui/AccountCogOutline'

// ** Type import
import { VerticalNavItemsType } from 'src/layouts/types'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'Summary',
      icon: HomeOutline,
      path: '/'
    },
    {
      title: 'Round',
      icon: AccountCogOutline,
      path: '/round'
    },
    {
      title: 'My History',
      icon: AccountCogOutline,
      path: '/underConstruction'
    },
    {
      title: 'Protocol Statistics',
      icon: AccountCogOutline,
      path: '/underConstruction'
    }
  ]
}

export default navigation
