import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { client } from '../trpc/client';
import { NextPage } from 'next';
import { Conversation, Message, Feature } from '../interfaces';
import useSWR from 'swr';

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
  const getData = client.users.getInitialPageData.query;
  const { data, error } = useSWR('users.getInitialPageData', () => getData(), {
    revalidateOnFocus: false
  });

  // const [isLoading, setIsLoading] = useState(true);
  // const [data, setData] = useState<any>(null);

  // const res = useSession();
  // useEffect(() => {
  //   const fetchData = async () => {
  //     console.log(res);
  //     if (res.status != 'authenticated') {
  //       return;
  //     }
  //     const _ = await client.users.getInitialPageData.query({
  //       session: res.data
  //     });
  //     console.log(_);
  //     setIsLoading(false);
  //     setData(_);
  //   };

  //   fetchData();
  // }, [res]);

  // if (isLoading) {
  //   return <div></div>;
  // }

  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div></div>;

  const mergedProps = { ...props, ...data };
  console.log(mergedProps);

  return <>{children(mergedProps)}</>;
};

export default DataFetcher;
