import '../styles/globals.css';

import type { AppProps } from 'next/app';
import { useState } from 'react';
import {
  DehydratedState,
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { AppConfig } from '../utils/appConfig';
import MainLayout from '../components/Layout/mainLayout';
import { Footer } from '../types/footer';

const MyApp = ({
  Component,
  pageProps,
}: AppProps<{ dehydratedState: DehydratedState; footer: Footer }>) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps.dehydratedState}>
          <MainLayout
            meta={{
              title: `${AppConfig.site_name} | ${AppConfig.job}`,
              description: AppConfig.description,
            }}
            footer={pageProps.footer}
          >
            <Component {...pageProps} />
          </MainLayout>
        </Hydrate>
      </QueryClientProvider>
    </>
  );
};

export default MyApp;
