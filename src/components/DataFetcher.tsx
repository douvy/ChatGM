import React, { useEffect, useState } from 'react';
import { getSession, useSession } from 'next-auth/react';
import { client } from '../trpc/client';
import { GetServerSideProps, NextPage } from 'next';
import { Conversation, Message, Feature, PageProps } from '../interfaces';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import MyAccount from '../components/MyAccount';
import { procedureTypes } from '@trpc/server';
import injector from '../utils/DataInjector';

const DataFetcher: NextPage<any> = ({ children, Component, ...props }) => {
  const router = useRouter();
  const currentRoute = router.asPath;
  if (currentRoute == '/auth/signin' || currentRoute == '/auth/signup') {
    return <Component {...props} />;
  }

  const getData = client.users.getInitialPageData.query;
  const { data, error } = useSWR('users.getInitialPageData', () => getData(), {
    revalidateOnFocus: false
  });

  if (error) router.push('/auth/signin'); //<div>Error: {error.message}</div>;
  if (!data) return <div></div>;
  const mergedProps = { ...props, ...data };
  injector.inject(data);
  console.log('data fetcher');

  return <>{children(mergedProps)}</>;
};

export default DataFetcher;
