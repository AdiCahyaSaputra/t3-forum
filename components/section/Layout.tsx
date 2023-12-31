import React, { useState } from 'react'
import Navbar from '../reusable/global/Navbar'
import AsideSection from './AsideSection'
import AsideToggle from '../reusable/global/AsideToggle'
import { useUser } from '@/lib/hooks'
import { TUser } from '@/lib/utils'

type TProps = {
  user: TUser,
  children: React.ReactNode,
}

const Layout: React.FC<TProps> = ({ user, children }) => {
  const [openMenu, setOpenMenu] = useState(false)
  const { user: currentUser } = useUser(user)

  return (
    <div className='bg-background text-foreground selection:bg-foreground selection:text-background'>

      <Navbar username={currentUser.username} image={currentUser.image} />

      <div className='flex relative items-start'>

        <AsideSection openMenu={openMenu} setOpenMenu={setOpenMenu} user={currentUser} />

        <main className='relative grow pb-10'>
          <AsideToggle setOpenMenu={setOpenMenu} />

          {children}

        </main>

      </div>

    </div>
  )
}

export default Layout
