import { FC } from 'react';

import { css } from '../../styled-system/css';
import { SystemStyleObject } from '../../styled-system/types';

const barStyle: SystemStyleObject = {
  rounded: '4px',
  bg: 'linear-gradient(to right, #bbb 50%, #888 50%) 0 0 / 20px 100% repeat-x',
  animation: 'progressBarBg 1s linear infinite',
};

type ProgressProps = {
  value: number;
};

export const Progress: FC<ProgressProps> = ({ value }) => (
  <progress
    className={css({
      appearance: 'none',
      w: '100%',
      h: '8px',
      rounded: '4px',
      display: 'block',
      '&::-webkit-progress-bar': {
        rounded: '4px',
        bg: '#eee',
      },
      '&::-webkit-progress-value': barStyle,
      '&::-moz-progress-bar': barStyle,
    })}
    max={100}
    value={value || 0}
  />
);
