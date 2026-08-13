import ChakraProvider from './ChakraProvider';

export const Providers = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider>{children}</ChakraProvider>
);
