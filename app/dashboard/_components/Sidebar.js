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
    <div className='shadow-sm h-screen p-7 flex flex-col justify-between'>
      {/* Top section */}
      <div>
        {/* Logo */}
        <div className="flex justify-center">
          <Image src={'/logo.svg'} alt='logo' width={150} height={120} />
        </div>

        {/* Menu Section */}
        <div className='mt-10 space-y-2'>
          <UploadPdf isMaxFile={fileList?.length >= 5}>
            <Button className="w-full">+ Upload PDF</Button>
          </UploadPdf>

          {/* Workspace link */}
          <Link href={'/dashboard'}>
            <div
              className={`flex gap-2 items-center p-3 hover:bg-slate-100 cursor-pointer rounded-md
                ${path === '/dashboard' && 'bg-slate-200'}`}
            >
              <Layout />
              <h2>Workspace</h2>
            </div>
          </Link>

          {/* Upgrade link */}
          <Link href={'/dashboard/upgrade'}>
            <div
              className={`flex gap-2 items-center p-3 hover:bg-slate-100 cursor-pointer rounded-md
                ${path === '/dashboard/upgrade' && 'bg-slate-200'}`}
            >
              <Shield />
              <h2>Upgrade</h2>
            </div>
          </Link>
        </div>
      </div>

      {/* Storage Usage Section */}
      <div className='w-[90%] mx-auto mt-10'>
        <Progress value={(fileList?.length / 5) * 100} />
        <p className='text-sm mt-1'>{fileList?.length} out of 5 PDFs uploaded</p>
        <p className='text-sm text-gray-400 mt-1'>Upgrade to upload more PDFs</p>
      </div>
    </div>
  )
}

export default Sidebar
