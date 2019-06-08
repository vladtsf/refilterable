import invariant from 'invariant';
import { FilterConfig, FilterObject } from './utils/types';
import { FILTER_OBJECT_MARKER, FILTER_HAS_OVEWRITES } from './utils/constants';


export default function createFilter<T>(paramName: string, config?: FilterConfig<T>): FilterObject<T> {
  invariant(
    String(paramName || '').length > 0,
    `re-filter: param name cannot be empty`,
  );

  const defaultConfig = {
    parse(input: string | undefined): any { return input; }, 
    format(value: T): string { return String(value); },
    validate(): boolean { return true; },
    defaultValue: undefined,
    [FILTER_OBJECT_MARKER]: true,
    [FILTER_HAS_OVEWRITES]: !config,
  };

  return {
    ...defaultConfig,
    ...config,
    paramName,
  };
}; 