import { FilterObject, LocationObserver } from './types';

export default function computeFilterValue(filter: FilterObject<any>, observer: LocationObserver) {
  const { parse, validate, defaultValue } = filter;
  const { hasParam, paramValue } = observer.getParamInfo(filter.paramName);

  // if param isn't present, immediately return the default value
  if (!hasParam) return typeof defaultValue === 'undefined' ? undefined : parse(defaultValue);
  // if param is invalid return invalid
  if (!validate(paramValue as string, parse)) return undefined;
  
  return parse(paramValue as string);
}
