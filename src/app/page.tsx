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
  {
    label: 'Single Question',
    href: ROUTES.MULTI_PAGE_FORM.SINGLE_QUESTION,
    category: 'Multi Page Form',
    image: `${repoBase}/images/multi-page-form-single-question.png`,
  },
  {
    label: 'Single Section',
    href: ROUTES.MULTI_PAGE_FORM.SINGLE_SECTION,
    category: 'Multi Page Form',
    image: `${repoBase}/images/multi-page-form-single-section.png`,
  },
  {
    label: 'Multiple Sections',
    href: ROUTES.SINGLE_PAGE_FORM.MULTIPLE_SECTIONS,
    category: 'Single Page Form',
    image: `${repoBase}/images/single-page-form-multiple-sections.png`,
  },
  {
    label: 'Collapsible Sections',
    href: ROUTES.SINGLE_PAGE_FORM.COLLAPSIBLE_SECTIONS,
    category: 'Single Page Form',
    image: `${repoBase}/images/single-page-form-collapsible-sections.png`,
  },
  {
    label: 'Map Interface',
    href: ROUTES.MAP.MAP_INTERFACE,
    category: 'Map',
    image: `${repoBase}/images/map-map-interface.png`,
  },
  {
    label: 'Embedded Form',
    href: ROUTES.ARTICLE,
    category: 'Article',
    image: `${repoBase}/images/article-embedded-form.png`,
  },
  {
    label: 'Charts',
    href: ROUTES.CHARTS,
    category: 'Charts',
    image: `${repoBase}/images/charts.png`,
  },
  {
    label: 'Tabular Interfaces',
    href: ROUTES.TABULAR_INTERFACES,
    category: 'Tabular Interfaces',
    image: `${repoBase}/images/tabular-interfaces.png`,
  },
]

export default function Home() {
  return (
    <div className='App pb-40'>
      <div className='max-w-[1024px] mx-auto px-5'>
        <h1 className='text-3xl font-bold text-center pt-8 pb-5'>
          WRI Design Systems Interfaces
        </h1>
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
  )
}
