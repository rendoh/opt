import { ComponentPropsWithoutRef, FC } from 'react';

import { css, cx } from '../../styled-system/css';

export const Table: FC<ComponentPropsWithoutRef<'table'>> = ({
  children,
  className,
  ...props
}) => (
  <table
    className={cx(
      css({
        w: '100%',
        maxW: '100%',
        border: '1px solid #ccc',
        '& :where(th, td)': {
          p: '4px 8px',
          fontSize: '12px',
          border: '1px solid #ccc',
        },
        '& :where(th)': {
          whiteSpace: 'nowrap',
          fontWeight: 'bold',
          fontSize: '12px',
          textAlign: 'left',
          bg: '#eee',
          pos: 'sticky',
          top: 0,
          _before: {
            content: '""',
            pos: 'absolute',
            top: '-1px',
            left: 0,
            w: '100%',
            h: '1px',
            bg: '#ccc',
          },
        },
        '& :where(td)': {
          wordBreak: 'break-all',
        },
      }),
      className,
    )}
    {...props}
  >
    {children}
  </table>
);
