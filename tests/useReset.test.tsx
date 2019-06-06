import React from 'react';
import { History } from 'history';
import { renderHook, act } from 'react-hooks-testing-library'
import { useFilter, useReset, FiltersProvider, createFilter } from '../src';
import { createMemoryHistory } from 'history';

describe('useReset', () => {
  let wrapper, history: History;

  beforeEach(() => {
    history = createMemoryHistory();
    
    wrapper = ({ children }) => (
      <FiltersProvider 
        history={history}
      >
        {children}
      </FiltersProvider>
    );
  });

  it('should throw an error when there is no provider in the tree', () => {
    expect(() => {
      renderHook(() => useReset()).result.current;
    }).toThrowErrorMatchingSnapshot();
  });


  it('should delete all the registered filters without default values', () => {
    const { result: hooks } = renderHook(() => [
      useFilter('foo'),
      useFilter('bar'),
      useReset(),
    ], { wrapper });

    act(() => {
      const [fooHook, barHook, reset] = hooks.current;

      // @ts-ignore
      const [, setFoo] = fooHook;
      // @ts-ignore
      const [, setBar] = barHook;

      // @ts-ignore
      setFoo('foo');
      // @ts-ignore
      setBar('bar');

      expect(history.location.search).toBe('?foo=foo&bar=bar');

      // @ts-ignore
      reset();
      expect(history.location.search).toBe('');
      expect(fooHook[0]).toBeUndefined();
      expect(barHook[0]).toBeUndefined();
    });
  });

  it('should reset all the registered filters with default values to their default values', () => {
    const { result: hooks } = renderHook(() => [
      useFilter(createFilter('foo', { defaultValue: 'foo' })),
      useReset(),
    ], { wrapper });

    act(() => {
      const [fooHook, reset] = hooks.current;

      // @ts-ignore
      const [, setFoo] = fooHook;

      // @ts-ignore
      setFoo('bar');

      expect(history.location.search).toBe('?foo=bar');

      // @ts-ignore
      reset();
      expect(history.location.search).toBe('?foo=foo');
      expect(fooHook[0]).toBe('foo');
    });
  });

  it('should not impact any URL parameters managed outside of re-filter', () => {
    history.push({ search: 'legacyParam=10' });
    const { result } = renderHook(() => useReset(), { wrapper });

    act(() => {
      const reset = result.current;
      reset();

    });

    expect(history.location.search).toBe('?legacyParam=10');
  });

  it('should not change the URL if the "dry" option is set to true', () => {
    history.push({ search: 'foo=bar' });
    
    const { result: hooks } = renderHook(() => [
      useFilter('foo'),
      useReset(),
    ], { wrapper });

    let nextSearch;

    act(() => {
      const reset = hooks.current[1];
      // @ts-ignore
      nextSearch = reset({ dry: true });
    });

    // @ts-ignore
    const [foo] = hooks.current[0];

    expect(history.location.search).toBe('?foo=bar');
    expect(foo).toBe('bar');
    expect(nextSearch).toBe('');
  });
  
});