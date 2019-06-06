import { useMemo, useContext, useCallback, useEffect, useDebugValue, useState } from 'react';
import invariant from 'invariant';
import { FilterObject, FilterSetter, SetFilterOptions, ForwardHistoryAction, isFilterObject, FiltersContextValue } from './types';
import createFilter from './createFilter';
import filtersContext from './filtersContext';

const defaultSetFilterOptions: SetFilterOptions = Object.freeze({
  dry: false,
  action: 'PUSH' as ForwardHistoryAction,
});


/**
 * Returns the current filter value, and a function to update it
 * 
 * @param filter can be either a string that'll server as the name of the url parameter or the filter configuration created with createFilter()
 */
export default function useFilter<T>(filterArg: FilterObject<T> | string): [T | undefined, FilterSetter<T>] {
  const filter = typeof filterArg === 'string' ? createFilter<T>(filterArg) : filterArg;

  invariant(
    isFilterObject(filter),
    `re-filter: you called useFilter (${filter.paramName || "[unknown param name]"}) and passed an invalid filter object. 
     Instead of constructing the configuration object on your own, 
     use the "createFilter" function.`
  );

  const context = useContext(filtersContext);

  invariant(
    context,
    `re-filter: Components that utilize the "useFilter" hook need to be wrapped with FiltersProvider.`,
  );

  // @ts-ignore because this is checked by invariant
  const { locationObserver, history, filterRegistry } = context;
  const { paramName, parse, format, validate, defaultValue } = filter;

  useEffect(() => {
    invariant(
        !filterRegistry.has(paramName) || filterRegistry.get(paramName) === filter,
        `re-filter: you attempted to register multiple filters with different configurations 
         under the same name (${paramName}), which is not allowed.`
    )

    filterRegistry.set(paramName, filter);

    return () => {
      filterRegistry.delete(paramName);
    }
  }, [paramName]);


  const [hasParam, setHasParam] = useState(locationObserver.current.getParamInfo(paramName).hasParam);
  const [paramValue, setParamValue] = useState(locationObserver.current.getParamInfo(paramName).paramValue);

  // react to changes in location and re-compute hasParam and paramValue variables
  useEffect(() => (
    locationObserver.current.watch(paramName, ({ hasParam, paramValue }: {
      hasParam: boolean; 
      paramValue: T,
    }) => {
      setHasParam(hasParam);
      setParamValue(paramValue);
    })
  ), [paramName]);

  const setFilter = useCallback((nextValue: T, options: SetFilterOptions = defaultSetFilterOptions): string => {
    const params = locationObserver.current.getCurrentParams();
    // apply the new value
    params.set(paramName, format(nextValue));
    // convert query to query string
    const queryString = params.toString();
    // dry run -> just return the next string (used in <Link> or <a>)
    if (options.dry) return queryString;

    switch (options.action) {
      case 'PUSH':
        history.push({ search: queryString });
        break;
      case 'REPLACE':
        history.replace({ search: queryString });
    }

    return queryString;
  }, []);

  const filterValue = useMemo(() => {
    // if param isn't present, immediately return the default value
    if (!hasParam) return defaultValue;
    // if param is invalid return invalid
    if (!validate(paramValue as string, parse)) return undefined;
    
    return parse(paramValue as string);
  }, [paramName, hasParam, paramValue]);


  // display the debug value in React inspector
  useDebugValue(paramName, () => `${paramName}: ${filterValue}`);

  return [filterValue, setFilter];
}
