import { UserButton } from '@clerk/nextjs'
import React from 'react'
import ThemeToggle from '@/components/ThemeToggle'
import Link from 'next/link'
import Image from 'next/image'
import { Sparkles, ArrowUpRight } from 'lucide-react'

function Header() {
  return (
    <div className='fade-slide-left sticky top-0 z-40 border-b border-border/60 glass-surface px-4 py-4 md:px-8 smooth-transition'>
      <div className='flex items-center gap-3'>
        <Link href='/' className='logo-shell inline-flex hover-lift md:hidden'>
          <Image src='/logo.svg' alt='logo' width={132} height={96} className='cursor-pointer' />
        </Link>

        <div className='rounded-full border border-border/70 bg-background/75 px-4 py-1.5 flex items-center gap-2 smooth-transition hover:bg-background/85'>
          <Sparkles className='h-3.5 w-3.5 text-primary' />
          <span className='text-xs font-semibold uppercase tracking-[0.14em] text-shimmer'>Premium Workspace</span>
        </div>

        <div className='ml-auto flex items-center gap-2'>
          <Link href='/dashboard/upgrade' className='hidden items-center gap-1.5 rounded-full border border-border/70 bg-background/75 px-3 py-1.5 text-xs font-semibold text-foreground smooth-transition button-press hover-lift hover:bg-accent/65 md:inline-flex'>
            Upgrade <ArrowUpRight className='h-3.5 w-3.5' />
          </Link>
          <ThemeToggle />
          <UserButton/>
        </div>
      </div>
    </div>
  )
}

export default Header