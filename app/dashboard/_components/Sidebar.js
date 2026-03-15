"use client"
import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Layout, Shield } from 'lucide-react'
import { Progress } from "@/components/ui/progress"
import UploadPdf from './UploadPdf'
import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

function Sidebar({ children, isMaxFile }) {
  const { user } = useUser()
  const path = usePathname()

  // Fetch files belonging to the logged-in user
  const fileList = useQuery(api.fileStorage.GetUserFiles, {
    userEmail: user?.primaryEmailAddress?.emailAddress
  })

  return (
    <aside className='h-screen border-r border-sidebar-border bg-sidebar text-sidebar-foreground p-6 flex flex-col justify-between'>
      {/* Top section */}
      <div>
        {/* Logo */}
        <div className="flex justify-center fade-rise">
          <div className="logo-shell">
            <Image src={'/logo.svg'} alt='logo' width={150} height={120} />
          </div>
        </div>

        {/* Menu Section */}
        <div className='mt-10 space-y-2'>
          <UploadPdf isMaxFile={fileList?.length >= 5}>
            <Button className="w-full rounded-xl font-semibold bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 smooth-transition button-press hover-lift">+ Upload PDF</Button>
          </UploadPdf>

          {/* Workspace link */}
          <Link href={'/dashboard'}>
            <div
              className={`flex gap-2 items-center p-3 cursor-pointer rounded-xl smooth-transition button-press
                ${path === '/dashboard' ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-md' : 'hover:bg-sidebar-accent/60'} hover-lift`}
            >
              <Layout />
              <h2 className='font-medium'>Workspace</h2>
            </div>
          </Link>

          {/* Upgrade link */}
          <Link href={'/dashboard/upgrade'}>
            <div
              className={`flex gap-2 items-center p-3 cursor-pointer rounded-xl smooth-transition button-press
                ${path === '/dashboard/upgrade' ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-md' : 'hover:bg-sidebar-accent/60'} hover-lift`}
            >
              <Shield />
              <h2 className='font-medium'>Upgrade</h2>
            </div>
          </Link>
        </div>
      </div>

      {/* Storage Usage Section */}
      <div className='rounded-2xl border border-sidebar-border bg-sidebar-accent/55 p-4 fade-rise-delay'>
        <Progress value={(fileList?.length / 5) * 100} />
        <p className='text-sm mt-2'>{fileList?.length || 0} out of 5 PDFs uploaded</p>
        <p className='text-xs text-sidebar-foreground/70 mt-1'>Upgrade to upload more PDFs</p>
      </div>
    </aside>
  )
}

export default Sidebar
