import invariant from 'invariant';
import { FILTER_COMPOSITION_MARKER } from './utils/constants';
import { FilterObject, FilterComposition, isFilterObject } from './utils/types';

// @todo: support filter compositions in filters
export default function composeFilters(filters: FilterObject<any>[], validate?: (input: any) => boolean): FilterComposition {
  invariant(
    filters && filters.length > 0,
    `re-filter: you called compose filters and didn't pass any filters `
  );

  invariant(
    filters.every(filter => isFilterObject(filter)),
    `re-filter: composeFilters() was called with non-filter objects. 
    Use createFilter() to create filters`,
  );

  return ({
    filters,
    validate: typeof validate === 'function' ? validate : () => true,
    [FILTER_COMPOSITION_MARKER]: true,
  } as FilterComposition) ;
} 