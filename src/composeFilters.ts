import { FILTER_COMPOSITION_MARKER } from './utils/constants';
import { FilterObject, FilterComposition } from './utils/types';

// @todo: support filter compositions in filters
export default function composeFilters(filters: FilterObject[], validate?: (input: any) => boolean): FilterComposition {
  return ({
    filters,
    validate: typeof validate === 'function' ? validate : () => true,
    [FILTER_COMPOSITION_MARKER]: true,
  } as FilterComposition) ;
}