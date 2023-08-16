import { FC } from 'react';

import { css, cva } from '../../styled-system/css';
import { OptimizeError, OptimizeResult } from '../optimize';
import { kb } from '../utils';
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

export const ResultTable: FC<ResultTableProps> = ({ results }) => (
  <Table>
    <thead>
      <tr>
        <th>File</th>
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
                  {kb(result.original_size)}
                </td>
                <td
                  className={css({
                    textAlign: 'right',
                    whiteSpace: 'nowrap',
                  })}
                >
                  {kb(result.final_size)}
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
