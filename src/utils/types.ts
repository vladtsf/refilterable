import { FilterComposition, FilterObject } from './types';
import { History } from 'history';
import { FILTER_OBJECT_MARKER, FILTER_COMPOSITION_MARKER } from './constants';

export type ParseFunction<T> = (input: string | undefined) => T | undefined;

export interface FilterObject<T = undefined> {
  paramName: string;
  parse: ParseFunction<T>;
  format(value: T): string;
  validate(input: string, parse: ParseFunction<T>): boolean;
  defaultValue?: string | undefined;
  resetValue?: T | undefined;
}

export interface FilterConfig<T = string> {
  parse?: ParseFunction<T>;
  format?(value: T): string;
  validate?(input: string, parse: ParseFunction<T>): boolean;
  defaultValue?: string | undefined;
  resetValue?: T | undefined;
}

export interface FilterComposition {
  filters: FilterObject<any>[],
  validate(input: { [paramName: string]: any }): boolean;
}

export type FilterDefinition<T = any> = FilterObject<T> | FilterComposition;

/**
 * User defined type guard to check if the passed object is a valid instance of FiterObject
 *
 * @param filter
 */
export function isFilterObject<T = any>(filter: FilterDefinition<T>): filter is FilterObject<T> {
  return Boolean(filter[FILTER_OBJECT_MARKER]);
}

/**
 * User defined type guard to check if the passed object is a valid instance of FiterObject
 *
 * @param filter
 */
export function isFilterComposition<T = undefined>(filter: FilterDefinition<T>): filter is FilterComposition {
  return Boolean(filter[FILTER_COMPOSITION_MARKER]);
}

export interface LocationObserver {
  watch(paramName: string, callback: Function): Function;
  notify(queryString: string);
  getParamInfo(paramName: string): { hasParam: boolean, paramValue: any };
  getCurrentParams(): URLSearchParams;
}

export interface FilterRegistry {
  getAllFilters(): FilterObject<any>[];
  isColliding(filter: FilterObject<any>): boolean;
  addFilterUse(filter: FilterObject<any>): void;
  deleteFilterUse(filter: FilterObject<any>): void;
}

export type FiltersContextValue = {
  locationObserver: LocationObserver;
  filterRegistry: FilterRegistry;
  history: History;
}

export type ForwardHistoryAction = 'PUSH' | 'REPLACE';

export type SetFilterOptions = {
  dry?: boolean;
  action?: ForwardHistoryAction;
  incrementally?: boolean,
};

export type FilterSetter<T = undefined> = (nextValue: T | any | { [paramName: string]: any }, options?: SetFilterOptions) => string;
export type FilterResetter = (options?: SetFilterOptions) => string;
