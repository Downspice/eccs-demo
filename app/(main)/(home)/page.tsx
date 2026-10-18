'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PageHome() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/setups');
  }, [router]);

  return null;
}
