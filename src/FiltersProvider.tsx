import React, { useEffect, useRef, FunctionComponent } from 'react';
import invariant from 'invariant';
import { History, Location } from 'history';
import filtersContext from './filtersContext';
import { FiltersContextValue, FilterObject } from './types';
import createLocationObserver from './createLocationObserver';
 
type Props = {
  history: History;
  children: JSX.Element[];
}

const FiltersProvider: FunctionComponent<Props> = ({ history, children }: Props) => {
  invariant(
    history,
    `re-filter: FiltersProvider was not passed a history instance. 
     Make sure you pass it via the history prop`,
  );

  const filterRegistry = useRef<Map<string, FilterObject<any>>>(new Map());
  const locationObserver = useRef(createLocationObserver(history.location.search));

  useEffect(() => {
    // listen to location changes
    const unlisten = history.listen((location: Location) => {
      locationObserver.current.notify(location.search);
    });

    // unsubscribe when the component unmounts
    return unlisten;
  }, []);

  const contextValue: FiltersContextValue = { 
    locationObserver,
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