import { open } from '@tauri-apps/api/dialog';
import { listen } from '@tauri-apps/api/event';
import { FC, useCallback, useEffect, useState } from 'react';
import { PiFolders, PiImages } from 'react-icons/pi';
import { RiDragDropLine } from 'react-icons/ri';

import { css } from '../../styled-system/css';
import { vstack } from '../../styled-system/patterns';
import { Button } from './Button';

export type SelectorProps = {
  onSelect: (inputs: string[]) => void;
};

export const Selector: FC<SelectorProps> = ({ onSelect }) => {
  const [isHovering, setIsHovering] = useState(false);
  useEffect(() => {
    const fileDropPromise = listen<string[]>('tauri://file-drop', (event) => {
      onSelect(event.payload);
      setIsHovering(false);
    });
    const fileDropHoverPromise = listen('tauri://file-drop-hover', () => {
      setIsHovering(true);
    });
    const fileDropCancelledPromise = listen(
      'tauri://file-drop-cancelled',
      () => {
        setIsHovering(false);
      },
    );
    return () => {
      fileDropPromise.then((unlisten) => {
        unlisten();
      });
      fileDropHoverPromise.then((unlisten) => {
        unlisten();
      });
      fileDropCancelledPromise.then((unlisten) => {
        unlisten();
      });
    };
  }, [onSelect]);

  const handleClickDirectorySelector = useCallback(async () => {
    const selected = await open({
      directory: true,
      multiple: true,
    });
    if (!selected) {
      return;
    }
    onSelect([selected].flat());
  }, [onSelect]);

  const handleClickFileSelector = useCallback(async () => {
    const selected = await open({
      directory: false,
      multiple: true,
    });
    if (!selected) {
      return;
    }
    onSelect([selected].flat());
  }, [onSelect]);

  return (
    <div
      className={css({
        w: '100%',
        h: '100%',
        p: '12px',
      })}
      style={{
        background: isHovering ? 'rgba(0, 0, 0, 0.12)' : 'transparent',
      }}
    >
      <div
        className={vstack({
          w: '100%',
          h: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          border: '2px dashed #ccc',
        })}
      >
        <RiDragDropLine
          className={css({
            fontSize: '64px',
            display: 'block',
            color: '#333',
          })}
        />
        <p
          className={css({
            height: '2em',
          })}
        >
          {isHovering ? (
            <span
              className={css({
                fontWeight: 'bold',
                fontSize: '120%',
              })}
            >
              Drop here!
            </span>
          ) : (
            <>
              <em
                className={css({
                  fontWeight: 'bold',
                })}
              >
                Drag and drop
              </em>{' '}
              or{' '}
              <em
                className={css({
                  fontWeight: 'bold',
                })}
              >
                select
              </em>{' '}
              <Button
                className={css({
                  mx: '4px',
                  verticalAlign: 'middle',
                })}
                onClick={handleClickDirectorySelector}
                icon={<PiFolders />}
              >
                directories
              </Button>{' '}
              or{' '}
              <Button
                className={css({
                  ml: '4px',
                  verticalAlign: 'middle',
                })}
                onClick={handleClickFileSelector}
                icon={<PiImages />}
              >
                files
              </Button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};
