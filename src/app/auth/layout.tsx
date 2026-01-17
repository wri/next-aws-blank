export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className='min-h-[calc(100vh-56px-48px)] lg:min-h-[calc(100vh-56px-96px)] 1121:min-h-[calc(100vh-56px-48px)] max-w-[1440px] flex flex-col 1121:items-center 1121:justify-center overflow-y-auto mx-auto'>
      {children}
    </div>
  )
}
