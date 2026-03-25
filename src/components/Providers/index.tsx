'use client'

import { ChakraProvider } from "@chakra-ui/react";
import { designSystemStyles } from "@worldresources/wri-design-systems";
import { LanguageProvider } from '@/contexts/LanguageContext'

const Providers = ({
  children,
  initialLanguage,
}: {
  children: React.ReactNode
  initialLanguage?: string
}) => (
  <ChakraProvider value={designSystemStyles}>
    <LanguageProvider initialLanguage={initialLanguage}>{children}</LanguageProvider>
  </ChakraProvider>
)

export default Providers
