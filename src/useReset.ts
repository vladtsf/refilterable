import { useContext, useCallback } from 'react';
import invariant from 'invariant';
import { FilterResetter, SetFilterOptions } from './utils/types';
import { defaultSetFilterOptions } from './utils/constants';
import filtersContext from './utils/filtersContext';
import applyHistoryAction from './utils/applyHistoryAction';

/**
 * Returns a function to reset all the registered filters to their default values.
 * If a filter doesn't have a default value specified, remove it
 * Filters that are not registered with useFilter will not be affected
 */
export default function useReset(): FilterResetter {
  const context = useContext(filtersContext);

  invariant(
    context,
    `re-filter: Components that utilize the "useFilter" hook need to be wrapped with FiltersProvider.`,
  );

  
  // @ts-ignore because this is checked by invariant
  const { locationObserver, history, filterRegistry } = context;

  const reset = useCallback((options: SetFilterOptions = defaultSetFilterOptions): string => {
    const params = locationObserver.getCurrentParams();
    
    filterRegistry
      .forEach(({ paramName, defaultValue }: { paramName: string, defaultValue: any }) => {
        if (typeof defaultValue === "undefined") {
          params.delete(paramName);
        } else {
          params.set(paramName, defaultValue);
        }
      });
      
    return applyHistoryAction(history, params, options);
  }, [history]);

  return reset;
}