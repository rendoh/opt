import { path } from '@tauri-apps/api';
import { message } from '@tauri-apps/api/dialog';
import { listen } from '@tauri-apps/api/event';
import { FC, useCallback, useEffect, useReducer, useState } from 'react';
import { VscRefresh, VscRunAll } from 'react-icons/vsc';

import { css } from '../styled-system/css';
import { vstack } from '../styled-system/patterns';
import { Button } from './components/Button';
import { Layout } from './components/Layout';
import { OptionEditor } from './components/OptionEditor';
import { Progress } from './components/Progress';
import { ResultTable } from './components/ResultTable';
import { Selector } from './components/Selector';
import { TargetImageTable } from './components/TargetImageTable';
import {
  getTargetImages,
  loadOptions,
  optimize,
  OptimizeError,
  OptimizeOptions,
  OptimizeResult,
  saveOptions,
  TargetImage,
} from './optimize';

function useTargetImages() {
  const [paths, setPaths] = useState<string[] | null>(null);
  const [targetImages, setTargetImages] = useState<TargetImage[] | null>(null);
  const clear = useCallback(() => {
    setPaths(null);
    setTargetImages(null);
  }, []);
  const setTargetImagesFromInputs = useCallback(async (paths: string[]) => {
    const set = new Set(paths.map((p) => p.split(path.sep).at(-1)));
    if (set.size !== paths.length) {
      await message('Files or directories with the same name are not allowed.');
      return;
    }
    const targetImages = await getTargetImages(paths);
    setTargetImages(targetImages);
    setPaths(paths);
  }, []);
  return {
    paths,
    targetImages,
    clear,
    setTargetImages: setTargetImagesFromInputs,
  };
}

function useOptimize() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<
    (OptimizeResult | OptimizeError)[] | null
  >(null);
  const run = useCallback(async (paths: string[], options: OptimizeOptions) => {
    setIsRunning(true);
    const results = await optimize(paths, options);
    saveOptions(options);
    setIsRunning(false);
    if (!results) return;
    setResults(results);
  }, []);

  return {
    run,
    isRunning,
    results,
  };
}

const OptimizeProgress: FC<{ total: number }> = ({ total }) => {
  const [current, increment] = useReducer((state) => state + 1, 0);
  useEffect(() => {
    const progressListener = listen('progress', () => {
      increment();
    });
    return () => {
      progressListener.then((unlisten) => {
        unlisten();
      });
    };
  }, []);

  return <Progress value={(current / total) * 100} />;
};

export const App: FC = () => {
  const { paths, targetImages, setTargetImages, clear } = useTargetImages();
  const { run, isRunning, results } = useOptimize();
  const [options, setOptions] = useState<OptimizeOptions>(() => loadOptions());
  const handleClickRun = useCallback(async () => {
    if (!paths) return;
    run(paths, options);
  }, [paths, options, run]);
  return (
    <Layout side={<OptionEditor value={options} onChange={setOptions} />}>
      {targetImages ? (
        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',
            h: '100%',
            overflowY: 'hidden',
          })}
        >
          <div
            className={vstack({
              p: '10px',
              gap: '10px',
            })}
          >
            <div
              className={css({
                w: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '10px',
              })}
            >
              <p
                className={css({
                  ml: 0,
                  mr: 'auto',
                })}
              >
                <span
                  className={css({
                    fontWeight: 'bold',
                  })}
                >
                  {targetImages.length}
                </span>{' '}
                image
                {targetImages.length > 1 && 's'} selected
              </p>
              <Button
                onClick={clear}
                disabled={isRunning}
                icon={<VscRefresh />}
              >
                Clear
              </Button>
              <Button
                onClick={handleClickRun}
                color="inverse"
                disabled={isRunning}
                icon={<VscRunAll />}
              >
                Select a destination and run
              </Button>
            </div>
            {isRunning && <OptimizeProgress total={targetImages.length} />}
          </div>
          <div
            className={css({
              flex: 1,
              overflowY: 'auto',
              p: '0 10px 10px',
            })}
          >
            {results ? (
              <ResultTable results={results} />
            ) : (
              <TargetImageTable targetImages={targetImages} />
            )}
          </div>
        </div>
      ) : (
        <Selector onSelect={setTargetImages} />
      )}
    </Layout>
  );
};
