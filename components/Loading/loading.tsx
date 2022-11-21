import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const Loading = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  console.log('"OK"');
  useEffect(() => {
    const handleStart = (url) => url !== router.asPath && setLoading(true);
    const handleComplete = (url) =>
      url === router.asPath &&
      setTimeout(() => {
        setLoading(false);
      }, 5000);
    console.log(router.events);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  });

  return loading ? (
    <div className='flex flex-col w-full h-screen antialiased bg-black-500'>
      Loading...
    </div>
  ) : null;
};

export default Loading;
