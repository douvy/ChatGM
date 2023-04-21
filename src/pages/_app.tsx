import '@/styles/globals.css';
import type { AppProps, AppType } from 'next/app';
import Head from 'next/head';
import { SessionProvider } from 'next-auth/react';
import React, { useEffect } from 'react';
import { trpc } from '../utils/trpc';
import DataFetcher from '../components/DataFetcher';
import Wrapper from '../components/Wrapper';
import { Provider } from 'react-redux';
import store from './store';

interface C {
  key?: string;
  e: any;
  shiftKey?: boolean;
}

const App: AppType = ({ Component, pageProps }: AppProps) => {
  const [c, setC] = React.useState<C>({
    key: '',
    e: null,
    shiftKey: false
  });
  const [selected, setSelected] = React.useState<string>('');

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      console.log('Key pressed:', event.key, typeof event.key);
      if (event.metaKey) {
        // console.log('Meta is down, skipping');
        // return;
      }
      if (typeof event.key == 'string') {
        setC({
          key: event.key,
          e: event
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  // console.log('_app', new Date().getSeconds(), new Date().getMilliseconds());
  return (
    <>
      <Head>
        <title>ChatGM</title>
        <meta
          name='description'
          content='a clean, visually appealing interface for ChatGPT'
        />
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        />
        <link rel='icon' href='/favicon.ico' />
        {/* <link rel="stylesheet" href="/fontawesome.min.css" /> */}
      </Head>
      {/* <Layout> */}
      <SessionProvider>
        <DataFetcher Component={Component} {...pageProps} c={c}>
          {/* <Component /> */}
          {(mergedProps: any) => {
            return (
              <Wrapper selected={selected} setSelected={setSelected}>
                <Component {...mergedProps} />
              </Wrapper>
            );
          }}
        </DataFetcher>
      </SessionProvider>
      {/* </Layout> */}
    </>
  );
};

// export default App;
export default trpc.withTRPC(App);
