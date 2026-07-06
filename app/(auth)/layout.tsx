export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden dashboard-grid-bg">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-violet-500/15 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        {children}
      </div>
    </div>
  )
}
