import { Conversation, Message, Feature } from '../interfaces';
import Home from '../components/Home';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { client } from '../trpc/client';

interface Session {
  user: {
    username: String;
    _id?: String;
  };
  _id?: String;
}

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
//   const props = await client.users.getInitialPageData.query({
//     session: session
//   });
//   console.log('Server side props:', props);
//   return {
//     props: props
//   };
// };

export default Home;
