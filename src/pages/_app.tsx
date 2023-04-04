import '@/styles/globals.css';
import type { AppProps, AppType } from 'next/app';
import Head from 'next/head';
import Layout from '../components/Layout';
import Provider from "next-auth/react";
import { SessionProvider } from "next-auth/react"
import React from 'react';
import { trpc } from '../utils/trpc';

const App: AppType = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <link rel="stylesheet" href="/fontawesome.min.css" />
      </Head>
      {/* <Layout> */}
      <SessionProvider>
        <Component {...pageProps} />
      </SessionProvider>
      {/* </Layout> */}
    </>
  );
}

// export default App;
export default trpc.withTRPC(App);
