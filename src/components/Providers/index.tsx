'use client'

import { ChakraProvider } from "@chakra-ui/react";
import { designSystemStyles } from "@worldresources/wri-design-systems";
import { LanguageProvider } from '@/contexts/LanguageContext'

const Providers = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider value={designSystemStyles}>
    <LanguageProvider>{children}</LanguageProvider>
  </ChakraProvider>
)

export default Providers
