import { createContext } from "react";
import { FiltersContextValue } from './types';

export default createContext<FiltersContextValue>({
  params: new URLSearchParams(),
  history: undefined,
  filterRegistry: new Map(),
});