import '@/styles/globals.css';
import type { AppProps, AppType } from 'next/app';
import Head from 'next/head';
import { SessionProvider } from "next-auth/react"
import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react';
import { trpc } from '../utils/trpc';
import { client } from '../trpc/client';
import DataFetcher from '../components/DataFetcher';

interface C {
  key?: string;
}
const App: AppType = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <title>ChatGM</title>
        <meta name="description" content="a clean, visually appealing interface for ChatGPT" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
        {/* <link rel="stylesheet" href="/fontawesome.min.css" /> */}
      </Head>
      {/* <Layout> */}
      <SessionProvider>
        <DataFetcher Component={Component} {...pageProps}>
          {/* <Component /> */}
          {(mergedProps: any) => {
            return <Component {...mergedProps} />
          }}
        </DataFetcher>
      </SessionProvider>
      {/* </Layout> */}
    </>
  );
}

// export default App;
export default trpc.withTRPC(App);
