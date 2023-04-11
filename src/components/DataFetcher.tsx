import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { client } from '../trpc/client';
import { NextPage } from 'next';
import { Conversation, Message, Feature } from '../interfaces';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import MyAccount from '../components/MyAccount';

interface PageProps {
  session: any;
  conversations: Conversation[];
  starredMessages: Message[];
  features?: Feature[];
  tasks?: any[];
  userInfo: any;
  activeTask: any;
  c: any;
}

const DataFetcher: NextPage<any> = ({ children, Component, ...props }) => {
  const router = useRouter();
  const currentRoute = router.asPath;
  if (currentRoute == '/auth/signin') {
    return <Component {...props} />;
  }

  const getData = client.users.getInitialPageData.query;
  const { data, error } = useSWR('users.getInitialPageData', () => getData(), {
    revalidateOnFocus: false
  });

  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div></div>;

  const mergedProps = { ...props, ...data };

  return <>{children(mergedProps)}</>;
};

export default DataFetcher;
