import React, { useEffect, useState, useCallback, useRef, FunctionComponent } from 'react';
import { History, Location, Action } from 'history';
import filtersContext from './filtersContext';
import { FiltersContextValue, FilterObject } from './types';
 
type Props = {
  history: History;
  children: JSX.Element[];
}

const FiltersProvider: FunctionComponent<Props> = ({ history, children }: Props) => {
  const initialParams = new URLSearchParams(history.location.search);
  const [params, setParams] = useState<URLSearchParams>(initialParams);
  const filterRegistry = useRef<Map<string, FilterObject<any>>>(new Map());

  useEffect(() => {
    // listen to location changes
    const unlisten = history.listen((location: Location, action: Action) => {
      const nextParams = new URLSearchParams(location.search);
      setParams(nextParams);
    });

    // unsubscribe when the component unmounts
    return unlisten;
  }, []);

  const contextValue: FiltersContextValue = { 
    params, 
    history, 
    filterRegistry: filterRegistry.current 
  };

  return (
    <filtersContext.Provider value={contextValue}>
      {children}
    </filtersContext.Provider>
  );
}


export default FiltersProvider;