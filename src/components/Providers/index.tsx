'use client'

import { ChakraProvider } from "@chakra-ui/react";
import { designSystemStyles } from "@worldresources/wri-design-systems";


const Providers = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider value={designSystemStyles}>
    {children}
  </ChakraProvider>
)

export default Providers
