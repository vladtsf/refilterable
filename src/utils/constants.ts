import { SetFilterOptions, ForwardHistoryAction } from './types';

export const CREATE_FILTER_MARKER = Symbol('createFilter');

export const defaultSetFilterOptions: SetFilterOptions = Object.freeze({
  dry: false,
  action: 'PUSH' as ForwardHistoryAction,
});