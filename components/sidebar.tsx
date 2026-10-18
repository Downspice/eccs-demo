'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  RiArrowRightSLine,
  RiCloseLine,
  RiEqualizerLine,
  RiMenu3Line,
} from '@remixicon/react';
import { useHotkeys } from 'react-hotkeys-hook';

import { cn } from '@/utils/cn';
import * as Divider from '@/components/ui/divider';

export type NavigationLink = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
};

export const navigationLinks: NavigationLink[] = [
  { icon: RiEqualizerLine, label: 'Setups', href: '/setups' },
];

function useCollapsedState({
  defaultCollapsed = false,
}: {
  defaultCollapsed?: boolean;
} = {}) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const sidebarRef = React.useRef<HTMLDivElement>(null);

  useHotkeys(
    ['ctrl+b', 'meta+b'],
    () => setCollapsed((prev) => !prev),
    { preventDefault: true },
    [collapsed],
  );

  return { collapsed, setCollapsed, sidebarRef };
}

export function SidebarHeader({ collapsed }: { collapsed?: boolean }) {
  return (
    <div
      className={cn('flex items-center gap-3 p-4 transition-all duration-300', {
        'justify-center px-2': collapsed,
        'px-5': !collapsed,
      })}
    >
      <div className='flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-base text-static-white shadow-sm'>
        <RiEqualizerLine className='size-5' />
      </div>
      {!collapsed && (
        <div className='flex flex-col truncate transition-opacity duration-300'>
          <span className='text-label-sm font-semibold text-text-strong-950'>
            ECCS
          </span>
          <span className='text-paragraph-xs text-text-sub-600 truncate'>
            Compliance & Security
          </span>
        </div>
      )}
    </div>
  );
}

function NavigationMenu({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();

  return (
    <div className='space-y-2'>
      <div className='space-y-1'>
        {navigationLinks.map(({ icon: Icon, label, href }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'group relative flex items-center gap-3 whitespace-nowrap rounded-lg py-2.5 text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950',
                'transition duration-200 ease-out',
                'aria-[current=page]:bg-bg-weak-50 aria-[current=page]:text-primary-base font-medium',
                {
                  'justify-center px-2 w-10 mx-auto': collapsed,
                  'w-full px-3': !collapsed,
                },
              )}
            >
              {isActive && (
                <div
                  className={cn(
                    'absolute top-1/2 h-5 w-1 origin-left -translate-y-1/2 rounded-r-full bg-primary-base',
                    {
                      '-left-2': collapsed,
                      '-left-3': !collapsed,
                    },
                  )}
                />
              )}

              <Icon
                className={cn(
                  'size-5 shrink-0 transition duration-200 ease-out',
                  isActive
                    ? 'text-primary-base'
                    : 'text-text-sub-600 group-hover:text-text-strong-950',
                )}
              />

              {!collapsed && (
                <div className='flex flex-1 items-center justify-between'>
                  <span className='text-label-sm'>{label}</span>
                  {isActive && (
                    <RiArrowRightSLine className='size-4 text-primary-base' />
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function Sidebar({
  defaultCollapsed = false,
}: {
  defaultCollapsed?: boolean;
} = {}) {
  const { collapsed, setCollapsed, sidebarRef } = useCollapsedState({
    defaultCollapsed,
  });
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Topbar */}
      <div className='flex h-14 w-full items-center justify-between border-b border-stroke-soft-200 bg-bg-white-0 px-4 lg:hidden'>
        <div className='flex items-center gap-2.5'>
          <div className='flex size-8 items-center justify-center rounded-lg bg-primary-base text-static-white'>
            <RiEqualizerLine className='size-4' />
          </div>
          <span className='text-label-sm font-semibold text-text-strong-950'>
            ECCS
          </span>
        </div>

        <button
          type='button'
          onClick={() => setMobileOpen((prev) => !prev)}
          className='flex size-9 items-center justify-center rounded-lg border border-stroke-soft-200 text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950'
          aria-label='Toggle menu'
        >
          {mobileOpen ? (
            <RiCloseLine className='size-5' />
          ) : (
            <RiMenu3Line className='size-5' />
          )}
        </button>
      </div>

      {/* Mobile Menu Backdrop & Drawer */}
      {mobileOpen && (
        <div className='fixed inset-0 z-40 lg:hidden'>
          <div
            className='fixed inset-0 bg-overlay'
            onClick={() => setMobileOpen(false)}
          />
          <div className='fixed inset-y-0 left-0 z-50 w-64 bg-bg-white-0 p-4 shadow-xl'>
            <div className='mb-4 flex items-center justify-between'>
              <div className='flex items-center gap-2.5'>
                <div className='flex size-8 items-center justify-center rounded-lg bg-primary-base text-static-white'>
                  <RiEqualizerLine className='size-4' />
                </div>
                <span className='text-label-sm font-semibold text-text-strong-950'>
                  ECCS
                </span>
              </div>
              <button
                type='button'
                onClick={() => setMobileOpen(false)}
                className='flex size-8 items-center justify-center rounded-lg text-text-sub-600 hover:bg-bg-weak-50'
              >
                <RiCloseLine className='size-5' />
              </button>
            </div>
            <Divider.Root className='my-3' />
            <NavigationMenu collapsed={false} />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 hidden h-full overflow-hidden border-r border-stroke-soft-200 bg-bg-white-0 transition-all duration-300 lg:block',
          {
            'w-18': collapsed,
            'w-64': !collapsed,
          },
        )}
      >
        <div
          ref={sidebarRef}
          className='flex h-full w-full flex-col justify-between overflow-y-auto'
        >
          <div>
            <SidebarHeader collapsed={collapsed} />
            <div className='px-4'>
              <Divider.Root />
            </div>
            <div className='p-3'>
              <NavigationMenu collapsed={collapsed} />
            </div>
          </div>

          {/* Bottom collapse toggle button */}
          <div className='p-3'>
            <div className='px-1 pb-3'>
              <Divider.Root />
            </div>
            <button
              type='button'
              onClick={() => setCollapsed((prev) => !prev)}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg py-2 text-text-soft-400 hover:bg-bg-weak-50 hover:text-text-sub-600 transition-colors',
                {
                  'justify-center px-0': collapsed,
                  'px-3': !collapsed,
                },
              )}
              title={
                collapsed ? 'Expand sidebar (⌘B)' : 'Collapse sidebar (⌘B)'
              }
            >
              <kbd className='rounded border border-stroke-soft-200 bg-bg-weak-50 px-1.5 py-0.5 text-[10px] font-medium text-text-sub-600'>
                ⌘B
              </kbd>
              {!collapsed && (
                <span className='text-paragraph-xs'>Collapse sidebar</span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Spacer to offset fixed sidebar on desktop */}
      <div
        className={cn('hidden shrink-0 transition-all duration-300 lg:block', {
          'w-18': collapsed,
          'w-64': !collapsed,
        })}
      />
    </>
  );
}
