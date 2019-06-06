import { SetFilterOptions, ForwardHistoryAction } from './types';

export const defaultSetFilterOptions: SetFilterOptions = Object.freeze({
  dry: false,
  action: 'PUSH' as ForwardHistoryAction,
});