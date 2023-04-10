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
    const handleKeyDown = (event: any) => {
      console.log("Key pressed:", event.key, typeof event.key);
      if (typeof event.key == "string") {
        setC({
          key: event.key
        });
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
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
