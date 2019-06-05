import { History } from 'history';

export const CREATE_FILTER_MARKER = Symbol("createFilter");

export interface FilterConfig<T = string> {
	parse?(input: string): T; 
  format?(value: T): string; 
  validate?(input: string, parse: (input: string) => T): boolean;
  defaultValue?: T | undefined;
}

export interface FilterObject<T = string> extends FilterConfig<T> {
  paramName: string;
  parse(input: string): T; 
  format(value: T): string; 
  validate(input: string, parse: (input: string) => T): boolean;
}

/**
 * User defined type guard to check if the passed object is a valid instance of FiterObject
 * 
 * @param filter 
 */
export function isFilterObject<T>(filter: any): filter is FilterObject<T> {
  return filter[CREATE_FILTER_MARKER];
  // if (typeof filter.paramName !== 'string') return false;
  // return ['parse', 'format', 'validate']
  //   .some(methodName => typeof filter[methodName] !== 'function');
}

export type FiltersContextValue = {
  params: URLSearchParams;
  history?: History;
  filterRegistry: Map<string, FilterObject<any>>,
}

export type ForwardHistoryAction = 'PUSH' | 'REPLACE';

export type SetFilterOptions = {
  dry?: boolean;
  action?: ForwardHistoryAction;
};

export type FilterSetter<T = string> = (nextValue: T, options?: SetFilterOptions) => string;
