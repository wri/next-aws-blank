'use client';

import Link from 'next/link';
import { Navbar, Menu } from '@worldresources/wri-design-systems';
import { WriLogoIcon } from '@/components/icons';
import { languageOptions } from '@/constants/language-options';

export default function AssessmentNavbar() {
  return (
    <Navbar 
      pathname="/assessment"
      linkRouter={Link}
      logo={
        <Link href={'/'}>
          <WriLogoIcon height='auto' width='120px' />
          <span className="font-semibold ml-7">Restoration Diagnostic</span>
        </Link>
      }
      navigationSection={[]}
      utilitySection={[
        <Menu
          key='language-menu'
          label='Language'
          items={languageOptions}
          onSelect={() => {}}
        />,
      ]}
      actionsSection={[]}
      maxWidth={1440}
      fixed
    />
  );
}
