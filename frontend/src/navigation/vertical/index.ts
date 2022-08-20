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
      path: '/history'
    }
  ]
}

export default navigation
