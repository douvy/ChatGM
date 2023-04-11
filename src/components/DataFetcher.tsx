import React, { useEffect, useState } from 'react';
import { getSession, useSession } from 'next-auth/react';
import { client } from '../trpc/client';
import { GetServerSideProps, NextPage } from 'next';
import { Conversation, Message, Feature } from '../interfaces';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import MyAccount from '../components/MyAccount';
import { procedureTypes } from '@trpc/server';

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

  return <>{children(mergedProps)}</>;
};

// export const getServerSideProps: GetServerSideProps<any> = async (
//   context: any
// ) => {
//   console.log('Getting server side props');
//   const session = await getSession(context);

//   if (!session) {
//     return {
//       redirect: {
//         destination: '/auth/signin',
//         permanent: false
//       }
//     };
//   }
//   const props = await client.users.getInitialPageData.query();
//   console.log('Server side props:', props);
//   return {
//     props: props
//   };
// };

export default DataFetcher;
