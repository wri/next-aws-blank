'use client';

import {
  ChakraProvider as ChakraProviderComponent,
  createSystem,
} from '@chakra-ui/react';
import { designSystemStyles } from '@worldresources/wri-design-systems';
import EmotionProvider from './EmotionProvider';

const customStylesSystem = createSystem(designSystemStyles._config, {
  theme: {
    tokens: {
      colors: {
        // neutral: {},
        // primary: { },
        // secondary: {},
        // success: {},
        // warning: {},
        // error: {},
        // accessible: {
        //   'text-on-primary-mids': { value: '' },
        //   'text-on-secondary-mids': { value: '' },
        //   'controls-on-neutral-lights': { value: '' },
        //   'controls-on-neutral-darks': { value: '' },
        // },
      },
    },
  },
});

const ChakraProvider = ({ children }: { children: React.ReactNode }) => (
  <EmotionProvider>
    <ChakraProviderComponent value={customStylesSystem}>
      {children}
    </ChakraProviderComponent>
  </EmotionProvider>
);

export default ChakraProvider;
