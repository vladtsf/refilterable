import { History } from 'history';
import { CREATE_FILTER_MARKER } from './constants';

export type ParseFunction<T> = (input: string | undefined) => T | undefined;



export interface FilterConfig<T = string> {
	parse?: ParseFunction<T>;
  format?(value: T): string; 
  validate?(input: string, parse: ParseFunction<T>): boolean;
  defaultValue?: string | undefined;
}

export interface FilterObject<T = string> extends FilterConfig<T> {
  paramName: string;
	parse: ParseFunction<T>;
  format(value: T): string; 
  validate(input: string, parse: ParseFunction<T>): boolean;
}

/**
 * User defined type guard to check if the passed object is a valid instance of FiterObject
 * 
 * @param filter 
 */
export function isFilterObject<T>(filter: any): filter is FilterObject<T> {
  return Boolean(filter[CREATE_FILTER_MARKER]);
}

export type FiltersContextValue = {
  locationObserver: { 
    watch(paramName: string, callback: Function): Function;
    getParamInfo(paramName: string): { hasParam: boolean, paramValue: any };
    getCurrentParams(): URLSearchParams;
  };
  history?: History;
  filterRegistry: Map<string, FilterObject<any>>,
}

export type ForwardHistoryAction = 'PUSH' | 'REPLACE';

export type SetFilterOptions = {
  dry?: boolean;
  action?: ForwardHistoryAction;
};

export type FilterSetter<T = string> = (nextValue: T, options?: SetFilterOptions) => string;
export type FilterResetter = (options?: SetFilterOptions) => string;
