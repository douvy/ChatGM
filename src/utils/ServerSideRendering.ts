import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { client } from '../trpc/client';

export const getServerSideProps: GetServerSideProps<any> = async (
  context: any
) => {
  console.log('Getting server side props');
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false
      }
    };
  }
  const props = await client.users.getInitialPageData.query({
    session: session
  });
  console.log('Server side props:', props);
  return {
    props: props
  };
};
