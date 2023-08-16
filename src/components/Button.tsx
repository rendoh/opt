import { ComponentPropsWithRef, FC } from 'react';

import { css, cva, cx, RecipeVariantProps } from '../../styled-system/css';

const button = cva({
  base: {
    rounded: '4px',
    fontSize: '14px',
    p: '6px 12px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    _disabled: {
      opacity: 0.7,
      cursor: 'not-allowed',
    },
  },
  variants: {
    color: {
      normal: {
        bg: '#eee',
        '&:not(:disabled):hover': {
          bg: '#e0e0e0',
        },
      },
      inverse: {
        bg: '#333',
        color: '#fff',
        '&:not(:disabled):hover': {
          bg: '#111',
        },
      },
    },
  },
  defaultVariants: {
    color: 'normal',
  },
});

type ButtonVariants = RecipeVariantProps<typeof button>;

export type ButtonProps = ComponentPropsWithRef<'button'> &
  ButtonVariants & {
    icon?: React.ReactNode;
  };

export const Button: FC<ButtonProps> = ({
  type = 'button',
  children,
  className,
  color,
  icon,
  ...props
}) => (
  <button
    className={cx(
      button({
        color,
      }),
      className,
    )}
    type={type}
    {...props}
  >
    {icon && (
      <span
        className={css({
          fontSize: '120%',
          display: 'block',
        })}
      >
        {icon}
      </span>
    )}
    <span
      className={css({
        display: 'block',
      })}
    >
      {children}
    </span>
  </button>
);
