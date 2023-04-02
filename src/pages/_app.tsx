import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Layout from '../components/Layout';
import Provider from "next-auth/react";
import { SessionProvider } from "next-auth/react"
import React from 'react';

export default function App({ Component, pageProps }: AppProps) {
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
