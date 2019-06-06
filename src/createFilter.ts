import { FilterConfig, FilterObject, CREATE_FILTER_MARKER } from './utils/types';


export default function createFilter<T>(paramName: string, config?: FilterConfig<T>): FilterObject<T> {
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