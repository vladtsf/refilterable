import { FilterRegistry, FilterObject } from './types';
import filterHasOverwrites from './filterHasOverwrites';

export default function createFilterRegistry(): FilterRegistry {
  const registered: Map<string, FilterObject<any>> = new Map();
  const refCounts: Record<string, number> = {};

  return {
    isColliding(filter: FilterObject<any>): boolean {
      if (!registered.has(filter.paramName)) return false;
      const storedFilter = <FilterObject<any>> registered.get(filter.paramName);
      if (filterHasOverwrites(filter) !== filterHasOverwrites(storedFilter)) return true;
      return filter !== storedFilter;
    },
    addFilterUse(filter: FilterObject<any>) {
      refCounts[filter.paramName] = (refCounts[filter.paramName] || 0) + 1;
      registered.set(filter.paramName, filter);
    },
    deleteFilterUse(filter: FilterObject<any>) {
      if (!registered.has(filter.paramName)) return;

      refCounts[filter.paramName]--;

      if (refCounts[filter.paramName] <= 0) {
        registered.delete(filter.paramName);
        delete refCounts[filter.paramName];
      }
    },
    getAllFilters(): FilterObject<any>[] {
      return Array.from(registered.values());
    },
  };
}
