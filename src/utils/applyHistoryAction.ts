import { History } from 'history';
import { SetFilterOptions } from './types';

export default function applyHistoryAction(
  history: History, 
  params: URLSearchParams, 
  options: SetFilterOptions
): string {
  // make sure the order of params is stable
  params.sort();
  // convert query to query string
  const queryString = params.toString();
  
  // dry run -> just return the next string (used in <Link> or <a>)
  if (options.dry) return queryString;
    
  switch (options.action) {
    case 'PUSH':
      history.push({ search: queryString });
      break;
    case 'REPLACE':
      history.replace({ search: queryString });
  }

  return queryString;
}