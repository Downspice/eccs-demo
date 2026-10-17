'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PageProductsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/stock-app/products');
  }, [router]);

  return null;
}
