import React from 'react'
import Sidebar from './_components/Sidebar'
import Header from './_components/Header'
import Link from 'next/link'
import { Layout, Shield } from 'lucide-react'

function Dashboardlayout({children}){
  return (
    <div className='min-h-screen bg-transparent'>
        <div className='hidden md:block md:w-72 h-screen fixed'>
            <Sidebar/>
        </div>
        <div className='md:ml-72'>
            <Header/>
        </div>
      <div className='md:ml-72 px-4 pb-8 pt-1 md:px-8'>
        {children}
      </div>

      <nav className='panel-luxe fade-rise fixed bottom-4 left-4 right-4 z-40 grid grid-cols-2 gap-2 rounded-2xl p-2 md:hidden'>
        <Link href='/dashboard' className='flex items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium text-foreground transition hover:bg-accent/65'>
          <Layout className='h-4 w-4' /> Workspace
        </Link>
        <Link href='/dashboard/upgrade' className='flex items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium text-foreground transition hover:bg-accent/65'>
          <Shield className='h-4 w-4' /> Upgrade
        </Link>
      </nav>
    </div>
  )
}

export default Dashboardlayout
