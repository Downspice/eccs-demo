'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PageOrdersRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/stock-app/orders');
  }, [router]);

  return null;
}
