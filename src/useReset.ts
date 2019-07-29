import { useContext, useCallback } from 'react';
import invariant from 'invariant';
import { FilterResetter, SetFilterOptions, FilterObject, FilterDefinition, isFilterComposition, isFilterObject } from './utils/types';
import { defaultSetFilterOptions } from './utils/constants';
import filtersContext from './utils/filtersContext';
import applyHistoryAction from './utils/applyHistoryAction';

/**
 * Returns a function to reset all the registered filters to their default values.
 * If a filter doesn't have a default value specified, remove it
 * Filters that are not registered with useFilter will not be affected
 */
export default function useReset(filter?: FilterDefinition): FilterResetter {
  const context = useContext(filtersContext);
  let filtersToReset: FilterObject<any>[];

  invariant(
    context,
    `refilterable: Components that utilize the "useFilter" hook need to be wrapped with FiltersProvider.`,
  );

  if (filter) {
    invariant(
      (isFilterComposition(filter) || isFilterObject(filter)),
      `refilterable: you called useReset() and passed an invalid filter object.
      Instead of constructing the configuration object on your own,
      use createFilter() or composeFilters().`
    );

    filtersToReset = isFilterComposition(filter) ? filter.filters : [filter];
  }

  // @ts-ignore because this is checked by invariant
  const { locationObserver, history, filterRegistry } = context;

  const reset = useCallback((options: SetFilterOptions = defaultSetFilterOptions): string => {
    const params = locationObserver.getCurrentParams();

    (filtersToReset || filterRegistry.getAllFilters())
      .forEach(({ paramName, format, resetValue }: FilterObject<any>) => {
        if (typeof resetValue === "undefined") {
          params.delete(paramName);
        } else {
          params.set(paramName, format(resetValue));
        }
      });

    return applyHistoryAction(history, params, options);
  }, [history]);

  return reset;
}
