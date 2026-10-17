'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PageAnalyticsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/stock-app/analytics');
  }, [router]);

  return null;
}
