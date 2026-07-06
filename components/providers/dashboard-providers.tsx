'use client'

import { MachineryProvider } from './machinery-provider'
import { ToastProvider } from './toast-provider'

export function DashboardProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <MachineryProvider>{children}</MachineryProvider>
    </ToastProvider>
  )
}
