import invariant from 'invariant';
import { FilterConfig, FilterObject } from './utils/types';
import { CREATE_FILTER_MARKER } from './utils/constants';


export default function createFilter<T>(paramName: string, config?: FilterConfig<T>): FilterObject<T> {
  invariant(
    String(paramName || '').length > 0,
    `re-filter: param name cannot be empty`,
  );

  const defaultConfig = {
    parse(input: string): any { return input; }, 
    format(value: T): string { return String(value); },
    validate(): boolean { return true; },
    defaultValue: undefined,
    [CREATE_FILTER_MARKER]: true,
  };

  return {
    ...defaultConfig,
    ...config,
    paramName,
  };
}; 