import { cn } from '@/utils/cn';

import './globals.css';

import type { Metadata } from 'next';
import { Nunito as FontSans } from 'next/font/google';

import { Providers } from '@/app/providers';

const nunito = FontSans({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ECCS - Setups',
  description: 'Enterprise Cloud Compliance & Security Setups',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      suppressHydrationWarning
      className={cn(nunito.variable, 'antialiased font-sans')}
    >
      <body className='bg-bg-white-0 font-sans'>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
