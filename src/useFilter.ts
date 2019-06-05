import { useMemo, useContext, useCallback, useEffect, useDebugValue } from 'react';
import invariant from 'invariant';
import { FilterObject, FilterSetter, SetFilterOptions, ForwardHistoryAction, isFilterObject } from './types';
import createFilter from './createFilter';
import filtersContext from './filtersContext';

// @todo: separate function
const defaultSetFilterOptions: SetFilterOptions = Object.freeze({
  dry: false,
  action: 'PUSH' as ForwardHistoryAction,
});

export default function useFilter<T>(filterArg: FilterObject<T> | string): [T | undefined, FilterSetter<T>] {
  const filter = typeof filterArg === 'string' ? createFilter<T>(filterArg) : filterArg;

  invariant(
    isFilterObject(filter),
    `re-filter: you called useFilter (${filter.paramName || "[unknown param name]"}) and passed an invalid filter object. 
     Instead of constructing the configuration object on your own, 
     use the "createFilter" function.`
  );

  const { params, history, filterRegistry } = useContext(filtersContext);
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

  // is the param present in query string
  const hasParam = params.has(paramName);
  // the value
  const paramValue = params.get(paramName);

  const setFilter = useCallback((nextValue: T, options: SetFilterOptions = defaultSetFilterOptions): string => {
    // don't mutate the existing params object
    const nextParams = new URLSearchParams(params);
    // apply the new value
    params.set(paramName, format(nextValue));
    // convert query to query string
    const queryString = params.toString();
    // dry run -> just return the next string (used in <Link> or <a>)
    if (options.dry) return queryString;
    // make sure history object is present
    if (history == null) return queryString;

    switch (options.action) {
      case 'PUSH':
        history.push({ search: queryString });
        break;
      case 'REPLACE':
        history.replace({ search: queryString });
    }

    return queryString;
  }, [params, history]);

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
