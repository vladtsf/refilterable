import { FilterRegistry, FilterObject } from './types';
import filterHasOverwrites from './filterHasOverwrites';

export default function createFilterRegistry(): FilterRegistry {
  const registered: Map<string, FilterObject<any>> = new Map();

  return { 
    isColliding(filter: FilterObject<any>): boolean {
      if (!registered.has(filter.paramName)) return false;
      const storedFilter = <FilterObject<any>> registered.get(filter.paramName);
      if (filterHasOverwrites(filter) !== filterHasOverwrites(storedFilter)) return true;
      return filter !== storedFilter;
    }, 
    addFilter(filter: FilterObject<any>) {
      registered.set(filter.paramName, filter);
    }, 
    removeFilter(filter: FilterObject<any>) {
      registered.delete(filter.paramName);
    },
    getAllFilters(): FilterObject<any>[] {
      return Array.from(registered.values());
    },
  };
}