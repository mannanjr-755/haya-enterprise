import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

/** Intrinsic dimensions of public/logo.png */
const LOGO_WIDTH = 670
const LOGO_HEIGHT = 477

const sizeClasses = {
  navbar: 'h-8 max-w-[104px] sm:h-9 sm:max-w-[118px] md:h-10 md:max-w-[132px]',
  sidebar: 'h-9 max-w-[148px] sm:h-10 sm:max-w-[160px]',
  auth: 'h-12 max-w-[180px] sm:h-14 sm:max-w-[200px]',
} as const

interface BrandLogoProps {
  href?: string | null
  size?: keyof typeof sizeClasses
  className?: string
  priority?: boolean
}

export function BrandLogo({
  href = '/dashboard',
  size = 'navbar',
  className,
  priority = false,
}: BrandLogoProps) {
  const image = (
    <Image
      src="/logo.png"
      alt="Haya Enterprises"
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      priority={priority}
      className={cn('w-auto shrink-0 object-contain object-left', sizeClasses[size], className)}
    />
  )

  if (href) {
    return (
      <Link
        href={href}
        className="flex shrink-0 items-center py-1"
        aria-label="Haya Enterprises — go to dashboard"
      >
        {image}
      </Link>
    )
  }

  return <div className="flex shrink-0 items-center py-1">{image}</div>
}
