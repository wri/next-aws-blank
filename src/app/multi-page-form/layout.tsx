export default function MultiPageFormLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className='mx-auto sm:py-16'>
      {children}
    </div>
  )
}