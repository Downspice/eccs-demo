import * as React from 'react';

export function SetupTablePanel({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-bg-white-0 shadow-xs'>
      {children}
    </div>
  );
}
