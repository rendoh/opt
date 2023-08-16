import { FC, PropsWithChildren, ReactNode } from 'react';

import { css } from '../../styled-system/css';

export type LayoutProps = PropsWithChildren<{
  side: ReactNode;
}>;

export const Layout: FC<LayoutProps> = ({ side, children }) => (
  <div
    className={css({
      display: 'flex',
      h: '100svh',
      '--side-menu-width': '250px',
    })}
  >
    <div
      className={css({
        w: 'var(--side-menu-width)',
        flexShrink: 0,
        h: '100%',
        bg: '#eee',
        overflowY: 'auto',
        p: '10px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '16px',
      })}
    >
      {side}
    </div>
    <div
      className={css({
        flex: 1,
        w: 'calc(100% - var(--side-menu-width))',
        maxW: 'calc(100% - var(--side-menu-width))',
        h: '100%',
        overflowY: 'auto',
      })}
    >
      {children}
    </div>
  </div>
);
