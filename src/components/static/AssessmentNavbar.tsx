'use client';

import Link from 'next/link';
import { Source_Serif_4 } from 'next/font/google';
import { Navbar, Menu, Button, getThemedColor } from '@worldresources/wri-design-systems';
import { WriLogoIcon } from '@/components/icons';
import { languageOptions } from '@/constants/language-options';

const sourceSerif4 = Source_Serif_4({
  subsets: ['latin'],
  weight: ['600']
});

export default function AssessmentNavbar() {
  // placeholder for SourceSerifPro
  console.log("🚀 ~ AssessmentNavbar ~ sourceSerif4:", sourceSerif4)
  return (
    <Navbar 
      pathname="/assessment"
      linkRouter={Link}
      logo={
        <Link href={'/'}>
          <WriLogoIcon height='auto' width='120px' />
          <Button variant="borderless" bgColor={"transparent"} fontSize={"18px"} color={getThemedColor("neutral", 800)}  css={{ ...sourceSerif4.style }}>
            Restoration Diagnostic
          </Button>  
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
      fixed
    />
  );
}
