'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ElectionsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/setups?module=elections');
  }, [router]);

  return null;
}
