import { FILTER_HAS_OVEWRITES } from './constants';
import { FilterObject } from './types';

export default function filterHasOverwrites(filter: FilterObject<any>): boolean {
  return filter[FILTER_HAS_OVEWRITES];
}