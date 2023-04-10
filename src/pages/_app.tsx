import '@/styles/globals.css';
import type { AppProps, AppType } from 'next/app';
import Head from 'next/head';
import Layout from '../components/Layout';
import Provider from "next-auth/react";
import { SessionProvider } from "next-auth/react"
import React, { useEffect } from 'react';
import { trpc } from '../utils/trpc';


const App: AppType = ({ Component, pageProps }: AppProps) => {
  const [c, setC] = React.useState<string | null>(null);

  useEffect(() => {
    const handleKeyPress = (event: any) => {
      console.log("Key pressed:", event.key);
      if (typeof event.key == "string") {
        setC(event.key);
      }
    };

    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  return (
    <>
      <Head>
      </Head>
      {/* <Layout> */}
      <SessionProvider>
        <Component {...pageProps} c={c} />
      </SessionProvider>
      {/* </Layout> */}
    </>
  );
}

// export default App;
export default trpc.withTRPC(App);
