import { Hero } from '@/components/static/Hero'
import { ROUTES } from '@/constants'
import Image from 'next/image'
import Link from 'next/link'

const repoBase = process.env.NEXT_PUBLIC_BASE_PATH || ''
const pages = [
  {
    label: 'Sign In',
    href: ROUTES.AUTH.SIGN_IN,
    category: 'Auth',
    image: `${repoBase}/images/auth-sign-in.png`,
  },
  {
    label: 'Sign Up',
    href: ROUTES.AUTH.SIGN_UP,
    category: 'Auth',
    image: `${repoBase}/images/auth-sign-up.png`,
  },
]

export default function Home() {
  return (
    <>
      <Hero />
      <div className='App pb-40 bg-gray-50 py-20'>
        <div className='max-w-[1024px] mx-auto'>
          <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-10'>
            {pages.map((page) => (
              <div key={page.label}>
                <Link href={page.href} className='cursor-pointer'>
                  <div className='h-[250px] flex items-center justify-center border border-neutral-300 rounded-lg overflow-hidden my-1 mb-2'>
                    <Image
                      src={page.image}
                      alt={page.label}
                      height={400}
                      width={600}
                    />
                  </div>
                  <p className='text-xs font-bold text-primary-500'>
                    {page.category}
                  </p>
                  <p className='text-lg font-bold'>{page.label}</p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
