import { FC } from 'react';

import { css, cva } from '../../styled-system/css';
import { OptimizeError, OptimizeResult } from '../optimize';
import { bytesToSize } from '../utils';
import { Table } from './Table';

export type ResultTableProps = {
  results: (OptimizeResult | OptimizeError)[];
};

const compressionRatioCell = cva({
  base: {
    textAlign: 'right',
    whiteSpace: 'nowrap',
    fontWeight: 'bold',
  },
  variants: {
    cr: {
      good: {
        color: 'success',
      },
      bad: {
        color: 'danger',
      },
    },
  },
});

function calcReducedSize(results: (OptimizeResult | OptimizeError)[]) {
  type Sizes = [original: number, final: number];
  const [original, final] = results.reduce<Sizes>(
    (acc, result) =>
      result.type === 'result'
        ? [acc[0] + result.original_size, acc[1] + result.final_size]
        : acc,
    [0, 0],
  );
  const compressionRatio = 1 - final / original;
  return `${bytesToSize(original)} to ${bytesToSize(final)} (${Math.round(
    compressionRatio * 100,
  )}%)`;
}

export const ResultTable: FC<ResultTableProps> = ({ results }) => (
  <Table>
    <thead>
      <tr>
        <th>
          <span
            className={css({
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              justifyContent: 'space-between',
              w: '100%',
            })}
          >
            File
            <small
              className={css({
                fontSize: '0.9em',
              })}
            >
              {calcReducedSize(results)}
            </small>
          </span>
        </th>
        <th>Original</th>
        <th>Final</th>
        <th>CR</th>
      </tr>
    </thead>
    <tbody>
      {results.map((result) => {
        const compressionRatio =
          result.type === 'result'
            ? 1 - result.final_size / result.original_size
            : 0;
        return (
          <tr key={result.path}>
            {result.type === 'result' ? (
              <>
                <td>{result.path}</td>
                <td
                  className={css({
                    textAlign: 'right',
                    whiteSpace: 'nowrap',
                  })}
                >
                  {bytesToSize(result.original_size)}
                </td>
                <td
                  className={css({
                    textAlign: 'right',
                    whiteSpace: 'nowrap',
                  })}
                >
                  {bytesToSize(result.final_size)}
                </td>
                <td
                  className={compressionRatioCell({
                    cr: compressionRatio
                      ? compressionRatio > 0
                        ? 'good'
                        : 'bad'
                      : undefined,
                  })}
                >
                  {Math.round(compressionRatio * 100)}%
                </td>
              </>
            ) : (
              <td
                colSpan={4}
                className={css({
                  bg: 'redLight',
                })}
              >
                {result.path}{' '}
                <span
                  className={css({
                    color: 'danger',
                    fontWeight: 'bold',
                    display: 'inline-block',
                  })}
                >
                  {result.error}
                </span>
              </td>
            )}
          </tr>
        );
      })}
    </tbody>
  </Table>
);
