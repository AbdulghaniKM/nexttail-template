'use client';

import { usePathname } from 'next/navigation';
import { AppIcon } from '@/components/ui/AppIcon';
import { AppLink } from '@/components/ui/AppLink';
import { useSidebar } from '@/hooks/useSidebar';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: 'icon-[solar--widget-5-linear]' },
  { href: '/', label: 'Back to site', icon: 'icon-[solar--home-2-linear]' },
] as const;

export function DashboardNav() {
  const pathname = usePathname();
  const { collapsed } = useSidebar();

  return (
    <>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <AppLink
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-text-secondary hover:bg-muted hover:text-text'
            }`}
          >
            <AppIcon name={item.icon} size={1.125} />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </AppLink>
        );
      })}
    </>
  );
}

export default DashboardNav;
