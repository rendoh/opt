import { FC } from 'react';

import { css } from '../../styled-system/css';
import { TargetImage } from '../optimize';
import { kb } from '../utils';
import { Table } from './Table';

export type TargetImageTableProps = {
  targetImages: TargetImage[];
};

export const TargetImageTable: FC<TargetImageTableProps> = ({
  targetImages,
}) => (
  <Table>
    <thead>
      <tr>
        <th>File</th>
        <th>Size</th>
      </tr>
    </thead>
    <tbody>
      {targetImages.map((targetImage) => (
        <tr key={targetImage.path}>
          <td>{targetImage.path}</td>
          <td
            className={css({
              textAlign: 'right',
              whiteSpace: 'nowrap',
            })}
          >
            {kb(targetImage.size)}
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
);
