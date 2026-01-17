'use client'

import { useState } from 'react'
import {
  Avatar,
  Menu,
  Navbar as WriNavbar,
} from '@worldresources/wri-design-systems'
import Link from 'next/link'
import { WriLogoIcon } from './icons'
import { usePathname } from 'next/navigation'
import { ROUTES } from '@/constants'

const languages = [
  {
    label: 'English',
    value: 'en',
  },
  {
    label: 'Spanish',
    value: 'es',
  },
]

const Navbar = () => {
  const [language, setLanguage] = useState('')
  const pathname = usePathname()

  const hideNavbar =
    pathname === ROUTES.MULTI_PAGE_FORM.SINGLE_QUESTION ||
    pathname === ROUTES.MULTI_PAGE_FORM.SINGLE_SECTION ||
    pathname === ROUTES.SINGLE_PAGE_FORM.MULTIPLE_SECTIONS ||
    pathname === ROUTES.SINGLE_PAGE_FORM.COLLAPSIBLE_SECTIONS
  if (hideNavbar) {
    return null
  }

  return (
    <WriNavbar
      logo={
        <Link href={ROUTES.HOME}>
          <WriLogoIcon height='32px' width='92px' />
        </Link>
      }
      linkRouter={Link}
      pathname={pathname}
      navigationSection={[
        {
          label: 'About',
          link: '#',
        },
        {
          label: 'Tools',
          items: [
            {
              label: 'Tool 1',
              link: '#',
            },
            {
              label: 'Tool 2',
              link: '#',
            },
          ],
        },
        {
          label: 'Data',
          items: [
            {
              label: 'Data 1',
              link: '#',
            },
            {
              label: 'Data 2',
              link: '#',
            },
          ],
        },
        {
          label: 'Use Cases',
          link: '#',
          items: [
            {
              label: 'Use Case 1',
              link: '#',
            },
            {
              label: 'Use Case 2',
              link: '#',
            },
          ],
        },
        {
          label: 'News',
          items: [
            {
              label: 'News 1',
              link: '#',
            },
          ],
        },
        {
          label: 'Help',
          link: '#',
        },
      ]}
      utilitySection={[
        <div
          key='avatar'
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Avatar
            name='John Doe'
            src='https://bit.ly/sage-adebayo'
            notificationCount={3}
          />
          <p>My Account</p>
        </div>,
        <Menu
          key='language-menu'
          label={
            languages?.find((l) => l.value === language)?.label || 'Language'
          }
          items={languages}
          onSelect={setLanguage}
        />,
        <p key='wri-apps'>WRI Apps</p>,
      ]}
      actionsSection={[
        { ariaLabel: 'Create account', onClick: () => {} },
        { ariaLabel: 'Sign in', onClick: () => {} },
      ]}
      maxWidth={1440}
      fixed
    />
  )
}

export default Navbar
