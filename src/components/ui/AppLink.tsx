'use client';

import Link, { useLinkStatus, type LinkProps } from 'next/link';
import { useEffect, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { pageLoader } from './AppPageLoader';

/**
 * Reports this link's pending state to the top progress bar. Must render as a
 * child of `<Link>` — that is where `useLinkStatus` reads from.
 */
function LinkProgressReporter() {
  const { pending } = useLinkStatus();

  useEffect(() => {
    if (pending) pageLoader.start();
  }, [pending]);

  return null;
}

// `typedRoutes` makes `LinkProps` generic over the route it points at — the
// parameter is threaded through so href strings stay checked against real routes.
export type AppLinkProps<RouteType> = LinkProps<RouteType> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps<RouteType>> & {
    children?: ReactNode;
  };

/**
 * `next/link` that drives `AppPageLoader`. Use it for in-app navigation so slow
 * route transitions show progress instead of appearing frozen.
 */
export function AppLink<RouteType>({ children, ...props }: AppLinkProps<RouteType>) {
  return (
    <Link {...props}>
      <LinkProgressReporter />
      {children}
    </Link>
  );
}

export default AppLink;
