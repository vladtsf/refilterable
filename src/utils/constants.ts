import { SetFilterOptions, ForwardHistoryAction } from './types';

export const FILTER_OBJECT_MARKER = Symbol('FILTER_OBJECT');
export const FILTER_COMPOSITION_MARKER = Symbol('FILTER_COMPOSITION');
export const FILTER_HAS_OVEWRITES = Symbol('FILTER_HAS_OVEWRITES');

export const defaultSetFilterOptions: SetFilterOptions = Object.freeze({
  dry: false,
  action: 'PUSH' as ForwardHistoryAction,
  incrementally: false,
});