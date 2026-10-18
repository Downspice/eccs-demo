import Sidebar from '@/components/sidebar';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='flex min-h-screen flex-col items-start lg:grid lg:grid-cols-[auto,minmax(0,1fr)] bg-bg-white-0'>
      <Sidebar />
      <main className='relative z-10 flex w-full min-w-0 flex-1 flex-col self-stretch'>
        {children}
      </main>
    </div>
  );
}
