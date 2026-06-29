'use client';

import { designSystemStyles } from '@worldresources/wri-design-systems';
import { ChakraProvider } from '@chakra-ui/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={designSystemStyles}>
      {children}
    </ChakraProvider>
  );
}
