import { createContext } from "react";
import { FiltersContextValue } from './types';
import createLocationObserver from "./createLocationObserver";

export default createContext<FiltersContextValue | null>(null);