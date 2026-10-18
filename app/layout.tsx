import { cn } from '@/utils/cn';

import './globals.css';

import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import localFont from 'next/font/local';

import { Providers } from '@/app/providers';

const inter = FontSans({
  subsets: ['latin'],
  variable: '--font-inter',
});

const interVar = localFont({
  src: '../assets/font/InterVariable.woff2',
  display: 'swap',
  variable: '--font-inter-var',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'ECCS - Levels',
  description: 'Enterprise Cloud Compliance & Security Levels',
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
      className={cn(inter.variable, interVar.variable, 'antialiased')}
    >
      <body className='bg-bg-white-0'>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
