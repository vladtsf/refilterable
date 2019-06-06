import React from 'react';
import { History } from 'history';
import { render } from '@testing-library/react'
import { FiltersProvider } from '../src';
import { createMemoryHistory } from 'history';

describe('FiltersProvider', () => {
  let history: History;

  beforeEach(() => {
    history = createMemoryHistory();
  });

  beforeEach(() => {
    // suppress unncecessary warnings
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error when the "history" prop is not passed', () => {
    expect(() => {
      // @ts-ignore
      render(<FiltersProvider />)
    }).toThrowErrorMatchingSnapshot();
  });

  it('should not re-render when location changes', () => {
    const WrappedFiltersProvider = jest.fn().mockImplementation(FiltersProvider);
    render(<WrappedFiltersProvider history={history} />);
    history.push({ search: 'foo=bar' });
    expect(WrappedFiltersProvider).toHaveBeenCalledTimes(1);
  });
  
});