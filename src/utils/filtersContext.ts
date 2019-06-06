import { createContext } from 'react';
import { FiltersContextValue } from './types';

export default createContext<FiltersContextValue | null>(null);