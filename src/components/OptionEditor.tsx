import { ComponentPropsWithoutRef, FC, PropsWithChildren } from 'react';

import { css, cx } from '../../styled-system/css';
import { stack } from '../../styled-system/patterns';
import { OptimizeOptions } from '../optimize';

export type OptionEditorProps = {
  value: OptimizeOptions;
  onChange: (value: OptimizeOptions) => void;
};

const optimizeTypes = ['both', 'optimize', 'webp'] as const;
const optimizeTypeLabels = {
  both: 'Optimize and convert to WebP',
  optimize: 'Optimize only',
  webp: 'Convert to WebP only',
};
type OptimizeType = (typeof optimizeTypes)[number];
const updateOptionsByOptionType = (
  type: OptimizeType,
  options: OptimizeOptions,
): OptimizeOptions => ({
  ...options,
  generate_webp: type !== 'optimize',
  optimize_images: type !== 'webp',
});
function getOptimizeType(options: OptimizeOptions): OptimizeType {
  if (options.generate_webp && !options.optimize_images) {
    return 'webp';
  }
  if (options.optimize_images && !options.generate_webp) {
    return 'optimize';
  }
  return 'both';
}

const Label: FC<PropsWithChildren> = ({ children }) => (
  <label
    className={css({
      fontWeight: 'bold',
      fontSize: '12px',
      display: 'block',
      w: 'fit-content',
      mb: '4px',
    })}
  >
    {children}
  </label>
);

const Select: FC<
  ComponentPropsWithoutRef<'select'> & {
    selectClassName?: string;
  }
> = ({ className, children, selectClassName, ...props }) => (
  <span
    className={cx(
      css({
        w: '100%',
        pos: 'relative',
        display: 'block',
        _after: {
          '--height': '7px',
          content: '""',
          bg: 'currentColor',
          display: 'block',
          pos: 'absolute',
          top: 'calc(50% - var(--height) / 2)',
          right: '8px',
          aspectRatio: '1.3 / 1',
          h: 'var(--height)',
          clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
        },
      }),
      className,
    )}
  >
    <select
      className={cx(
        css({
          w: '100%',
          display: 'block',
          appearance: 'none',
          bg: '#fff',
          p: '4px 8px',
          pr: '24px',
          fontSize: '12px',
          border: '1px solid #ccc',
          rounded: '4px',
          cursor: 'pointer',
        }),
        selectClassName,
      )}
      {...props}
    >
      {children}
    </select>
  </span>
);

const Slider: FC<
  Omit<
    ComponentPropsWithoutRef<'input'>,
    'type' | 'className' | 'min' | 'max' | 'value'
  > & {
    min: number;
    max: number;
    value: number;
  }
> = (props) => (
  <span
    className={css({
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    })}
    style={{
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ['--progress' as any]: `${
        ((props.value - props.min) / (props.max - props.min)) * 100
      }%`,
    }}
  >
    <input
      className={css({
        w: '100%',
        flex: 1,
        appearance: 'none',
        cursor: 'grab',
        height: '8px',
        rounded: '4px',
        bg: 'linear-gradient(to right, #888 var(--progress), #fff var(--progress))',
        border: '1px solid #ccc',
        '&::-webkit-slider-thumb': {
          appearance: 'none',
          bg: '#fff',
          width: '24px',
          aspectRatio: '1 / 1',
          rounded: '50%',
          border: '1px solid #ccc',
        },
        '&::-moz-range-thumb': {
          appearance: 'none',
          bg: '#fff',
          width: '24px',
          aspectRatio: '1 / 1',
          rounded: '50%',
          border: '1px solid #ccc',
        },
        _active: {
          '&::-webkit-slider-thumb': {
            cursor: 'grabbing',
            bg: '#ccc',
          },
        },
      })}
      type="range"
      {...props}
    />
    <input
      className={css({
        flexShrink: 0,
        w: '44px',
        appearance: 'none',
        bg: '#fff',
        p: '4px 8px',
        fontSize: '12px',
        border: '1px solid #ccc',
        textAlign: 'right',
        rounded: '4px',
        '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
          appearance: 'none',
          margin: 0,
        },
      })}
      type="number"
      min={props.min}
      max={props.max}
      step={props.step}
      value={props.value}
      onChange={props.onChange}
    />
  </span>
);

export const OptionEditor: FC<OptionEditorProps> = ({ value, onChange }) => (
  <div
    className={stack({
      direction: 'column',
      gap: '16px',
    })}
  >
    <div>
      <Label>Optimize Type</Label>
      <Select
        onChange={(e) => {
          onChange(
            updateOptionsByOptionType(e.target.value as OptimizeType, value),
          );
        }}
        value={getOptimizeType(value)}
      >
        {optimizeTypes.map((type) => (
          <option key={type} value={type}>
            {optimizeTypeLabels[type]}
          </option>
        ))}
      </Select>
    </div>
    {value.optimize_images && (
      <>
        <div>
          <Label>JPEG Quality</Label>
          <Slider
            min={1}
            max={100}
            step={1}
            value={value.jpg_quality}
            onChange={(e) =>
              onChange({
                ...value,
                jpg_quality: e.target.valueAsNumber,
              })
            }
          />
        </div>
        <div>
          <Label>PNG Compressor</Label>
          <Select
            onChange={(e) =>
              onChange({
                ...value,
                use_png8: e.target.value === 'imagequant',
              })
            }
            value={value.use_png8 ? 'imagequant' : 'oxipng'}
          >
            <option value="oxipng">Oxipng (lossless)</option>
            <option value="imagequant">Imagequant (lossy - PNG8)</option>
          </Select>
        </div>
        {value.use_png8 && (
          <div>
            <Label>PNG8 Quality</Label>
            <Slider
              min={1}
              max={100}
              step={1}
              value={value.png8_quality}
              onChange={(e) =>
                onChange({
                  ...value,
                  png8_quality: e.target.valueAsNumber,
                })
              }
            />
          </div>
        )}
      </>
    )}
    {value.generate_webp && (
      <>
        {value.optimize_images && (
          <div>
            <Label>Generate WebP from</Label>
            <Select
              onChange={(e) =>
                onChange({
                  ...value,
                  webp_from_optimized: e.target.value === 'optimized',
                })
              }
              value={value.webp_from_optimized ? 'optimized' : 'original'}
            >
              <option value="original">Original images</option>
              <option value="optimized">Optimized images</option>
            </Select>
          </div>
        )}
        <div>
          <Label>WebP Quality</Label>
          <Slider
            min={1}
            max={100}
            step={1}
            value={value.webp_quality}
            onChange={(e) =>
              onChange({
                ...value,
                webp_quality: e.target.valueAsNumber,
              })
            }
          />
        </div>
      </>
    )}
  </div>
);
