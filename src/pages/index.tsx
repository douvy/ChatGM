import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'

export default function Home() {
  return (
    <>
      <Head>
        <title>ChatGM</title>
        <meta name="description" content="a clean, visually appealing interface for ChatGPT" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div>
          <h1 className="uppercase">test</h1>
          <h2>test</h2>
          <h1 className="text-3xl font-bold underline uppercase">
            Hello world!
          </h1>
        </div>
      </main>
    </>
  )
}