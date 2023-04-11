import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react';
import { client } from '../trpc/client';
import { NextPage } from 'next';
import { Conversation, Message, Feature } from '../interfaces';


interface C {
  key?: string;
}

interface PageProps {
  session: any,
  conversations: Conversation[],
  starredMessages: Message[],
  features?: Feature[],
  tasks?: any[],
  userInfo: any,
  activeTask: any,
  c: any,
}

const DataFetcher: NextPage<any> = ({ children, Component, ...props }) => {


  const [c, setC] = React.useState<C>({});

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

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const res = useSession();
  useEffect(() => {
    const fetchData = async () => {
      console.log(res);
      if (res.status != "authenticated") {
        return;
      }
      const _ = await client.users.getInitialPageData.query({
        session: res.data,
      });
      console.log(_);
      setIsLoading(false);
      setData(_);
    }

    fetchData();
  }, [res]);

  if (isLoading) {
    return <div></div>;
  }

  const mergedProps = { ...props, ...data, c }
  console.log(mergedProps);

  return <>{children(mergedProps)}</>;
}


export default DataFetcher;
