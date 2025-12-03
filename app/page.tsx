'use client';
import { Button, Logo } from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && isAuthenticated && pathname === '/') {
      router.push('/auctions');
    }
  }, [isAuthenticated, isLoading, router, pathname]);
  return (
    <div className="flex flex-col w-screen h-screen justify-between items-center">
      <div className="w-full flex justify-between items-center py-5 px-8 ">
        <Logo size="md" />
        <div className=" flex items-center justify-between w-[172px]">
          <Link
            href="/login"
            className="font-bold text-base leading-6 w-12 hover:underline"
          >
            Log in
          </Link>
          <p className="font-light text-base leading-6 w-4 text-black">or</p>
          <Link href="/register">
            <Button variant={'secondary'}>Sign up</Button>
          </Link>
        </div>
      </div>
      <div className="px-6 py-24 text-center">
        <h1 className="text-6xl font-bold text-text-primary mb-6 text-balance">
          E-auctions made easy!
        </h1>
        <p className=" text-md font-light text-text-primary mb-10  mx-auto">
          Simple way for selling your unused products, or <br />
          getting a deal on product you want!
        </p>
        <Link href="/register">
          <Button>Start bidding</Button>
        </Link>
      </div>
      <div className="h-1/2 w-full flex flex-col justify-start items-center overflow-hidden">
        <Image
          src="/landing-page-screenshot-full.png"
          width={1440}
          height={1024}
          alt="Screenshot of Auction Bay landing page"
          className="w-4/5 border-4 rounded-2xl border-gray-950"
        />
      </div>
    </div>
  );
}
