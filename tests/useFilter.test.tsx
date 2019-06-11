import React from 'react';
import { History } from 'history';
import { render, act as reactTestingLibraryAct } from '@testing-library/react'
import { renderHook, act } from 'react-hooks-testing-library'
import { useFilter, FiltersProvider, createFilter, composeFilters } from '../src';
import { createMemoryHistory } from 'history';

describe('useFilter', () => {
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

  beforeEach(() => {
    // suppress unncecessary warnings
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error when there is no provider in the tree', () => {
    expect(() => {
      renderHook(() => useFilter('foo')).result.current;
    }).toThrowErrorMatchingSnapshot();
  });

  it('should work if only the URL param name is passed', () => {
    const { result } = renderHook(() => useFilter<string>('foo'), { wrapper });;
    const [ foo, setFoo ] = result.current;

    expect(foo).toBeUndefined();
    expect(setFoo).toBeInstanceOf(Function);
  });

  it('should throw an error if there is a filter configuration collision', () => {
    const fooOne = createFilter('foo', { validate() { return true } });
    const fooTwo = createFilter('foo', { validate() { return false } });
    expect(() => {
      renderHook(() => [
        useFilter(fooOne),
        useFilter(fooTwo)
      ], { wrapper });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      renderHook(() => [
        useFilter('foo'),
        useFilter(fooTwo)
      ], { wrapper });
    }).toThrowErrorMatchingSnapshot();
  });

  it('should not allow to initialize filters with plain objects', () => {
    const filter = JSON.parse(JSON.stringify(createFilter('foo')));

    expect(() => {
      renderHook(() => useFilter(filter), { wrapper }).result.current;
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      // @ts-ignore
      renderHook(() => useFilter({ paramName: undefined }), { wrapper }).result.current;
    }).toThrowErrorMatchingSnapshot();
  });

  describe('read and update filter values', () => {
    it('should allow to change the filter value', () => {
      const { result } = renderHook(() => useFilter('foo'), { wrapper });

      act(() => {
        const [_, setFoo] = result.current;
        setFoo('bar');
      });

      const [foo, _] = result.current;

      expect(foo).toBe('bar');
    });

    describe('parse()', () => {
      let parse, filter;

      beforeEach(() => {
        parse = jest.fn().mockImplementation(input => parseInt(input));
        filter = createFilter('foo', { parse });
      });

      it('should call the parse method in order to calculate the current value', () => {
        history.push({ search: '?foo=bar' });
        renderHook(() => useFilter(filter), { wrapper }).result.current;
        expect(parse).toHaveBeenCalledWith('bar');
      });
  
      it('should call the parse method with the default value when the filter is not specified', () => {
        history.push({ search: '?' });
        const filter = createFilter('foo', { parse, defaultValue: 'bar' });
        renderHook(() => useFilter(filter), { wrapper }).result.current;
        expect(parse).toHaveBeenCalledWith(filter.defaultValue);
      });

      it('should not call the parse method when the filter as well as its default value are not specified', () => {
        history.push({ search: '?' });
        renderHook(() => useFilter(filter), { wrapper }).result.current;
        expect(parse).not.toHaveBeenCalled();
      });

    });

    describe('validate()', () => {
      let parse, validate, filter;

      beforeEach(() => {
        parse = jest.fn().mockImplementation(input => parseInt(input));
        validate = jest.fn().mockImplementation((input, parse) => parse(input) >= 0);
        filter = createFilter('page', { parse, validate });
      });

      it('should call validate and return undefined if the value in the URL is invalid', () => {
        history.push({ search: '?page=-1' });
        const [page, _] = renderHook(() => useFilter(filter), { wrapper }).result.current;

        expect(validate).toHaveBeenCalled();
        expect(page).toBeUndefined();
      });

      it('should let the value be calculated if it is valid', () => {
        history.push({ search: '?page=1' });
        const [page, _] = renderHook(() => useFilter(filter), { wrapper }).result.current;

        expect(validate).toHaveBeenCalled();
        expect(page).toBe(1);
      });

    });

    describe('format()', () => {
      it('should throw an exception if a formatter produces a non-string value', () => {
        const format = jest.fn().mockReturnValue(100);
        const filter = createFilter('foo', { format });
        const [_, setFoo] = renderHook(() => useFilter(filter), { wrapper }).result.current;

        expect(() => act(() => {
          setFoo('bar');
        })).toThrowErrorMatchingSnapshot();
      });
    });

    describe('changing the filter value', () => {
      it('should reflect the new value in the URL', () => {
        const { result } = renderHook(() => useFilter('foo'), { wrapper });
        let nextSearch;

        act(() => {
          const [_, setFoo] = result.current;

          nextSearch = setFoo('bar');
        });

        const [foo, _] = result.current;
        expect(foo).toBe('bar');
        expect(history.location.search).toBe('?foo=bar');
        expect(nextSearch).toBe('foo=bar');
      });

      it('should not change the url if the "dry" option is set to true', () => {
        history.push({ search: 'foo=bar' });
        const { result } = renderHook(() => useFilter('foo'), { wrapper });
        let nextSearch;

        act(() => {
          const [_, setFoo] = result.current;
          nextSearch = setFoo('baz', { dry: true });
        });

        const [foo, _] = result.current;
        expect(foo).toBe('bar');
        expect(history.location.search).toBe('?foo=bar');
        expect(nextSearch).toBe('foo=baz');
      });

      it('should call history.push() if the action is not explicitly specified', () => {
        const push = jest.spyOn(history, 'push');
        const { result } = renderHook(() => useFilter('foo'), { wrapper });

        act(() => {
          const [_, setFoo] = result.current;
          setFoo('bar');
        });

        expect(push).toHaveBeenCalledWith({ search: 'foo=bar' })
      });

      it('should call history.replace() if the corresponding option is specified', () => {
        const replace = jest.spyOn(history, 'replace');
        const { result } = renderHook(() => useFilter('foo'), { wrapper });

        act(() => {
          const [_, setFoo] = result.current;
          setFoo('bar', { action: 'REPLACE' });
        });

        expect(replace).toHaveBeenCalledWith({ search: 'foo=bar' })
      });

    });

    describe('receiving chages from the outside', () => {
      it('should receive location changes (push)', () => {
        const { result } = renderHook(() => useFilter('foo'), { wrapper });

        act(() => {
          history.push({ search: 'foo=bar' });
        });

        const [foo, _] = result.current;

        expect(foo).toBe('bar');
      });

      it('should receive location changes (push)', () => {
        const { result } = renderHook(() => useFilter('foo'), { wrapper });

        act(() => {
          history.replace({ search: 'foo=bar' });
        });

        const [foo, _] = result.current;

        expect(foo).toBe('bar');
      });

      it('should call parse() and validate() when location changes', () => {
        const parse = jest.fn().mockReturnValue(10);
        const validate = jest.fn().mockReturnValue(true);
        const filter = createFilter('foo', { parse, validate })
        renderHook(() => useFilter(filter), { wrapper });

        act(() => {
          history.push({ search: 'foo=bar' });
        });

        expect(parse).toHaveBeenCalled();
        expect(validate).toHaveBeenCalled();
      });

      it('should not call parse() and validate() when location changes but it does not affect the current filter', () => {
        const parse = jest.fn().mockReturnValue(10);
        const validate = jest.fn().mockReturnValue(true);
        const filter = createFilter('foo', { parse, validate })
        renderHook(() => useFilter(filter), { wrapper });

        act(() => {
          history.push({ search: 'page=1000' });
        });

        expect(parse).not.toHaveBeenCalled();
        expect(validate).not.toHaveBeenCalled();
      });

    });

  });

  describe('interaction with provider', () => {
    it('should not allow multiple configurations to be attached to the same URL parameter', () => {
      expect(() => {
        renderHook(() => [
          useFilter<string>('foo'),
          useFilter<string>(createFilter('foo', { parse: (): string => '' })),
        ], { wrapper });
      }).toThrowErrorMatchingSnapshot();
    });

    it('should not throw an error when there are multiple configurations for the same URL parameter but under different providers', () => {
      expect(() => {
        renderHook(() => useFilter<string>('foo'), { wrapper });
        renderHook(() => (
          useFilter<string>(createFilter('foo', { parse: (): string => '' }))
        ), { wrapper });
      }).not.toThrow();
    });
  });

  describe('composite filters', () => {
    const minFilter = createFilter('min', { 
      parse: parseInt,
      defaultValue: '0',
    });
    const maxFilter = createFilter('max', { 
      parse: parseInt,
      defaultValue: '100',
    });
    
    const rangeFilter = composeFilters([
      minFilter, 
      maxFilter
    ], ({ min, max }) => min <= max);
    
    it('should take composite filters', () => {
      const { result } = renderHook(() => useFilter(rangeFilter), { wrapper });

      act(() => {
        history.push({ search: 'min=100&max=200' });
      });

      const [range] = result.current;

      expect(range).toEqual({ min: 100, max: 200 });
    });

    it('should allow to set composite filter values', () => {
      const { result } = renderHook(() => useFilter(rangeFilter), { wrapper });

      act(() => {
        const [, setRange] = result.current;
        setRange({ min: 100, max: 200 });
      });

      const [range] = result.current;

      expect(range).toEqual({ min: 100, max: 200 });
      expect(history.location.search).toBe('?max=200&min=100');
    });

    it('should allow to set values of the filters incrementally', () => {
      const { result } = renderHook(() => useFilter(rangeFilter), { wrapper });

      let nextSearch;

      act(() => {
        history.push({ search: 'min=100&max=200' });
        const [, setRange] = result.current;
        nextSearch = setRange({ min: 150 }, { incrementally: true });
      });

      const [range] = result.current;

      expect(range).toEqual({ min: 150, max: 200 });
      expect(nextSearch).toBe('max=200&min=150');
      expect(history.location.search).toBe('?max=200&min=150');
    });

    it('should not set values of the filters incrementally by default', () => {
      const { result } = renderHook(() => useFilter(rangeFilter), { wrapper });

      let nextSearch;

      act(() => {
        history.push({ search: 'min=100&max=200' });
        const [, setRange] = result.current;
        nextSearch = setRange({ min: 50 });
      });

      const [range] = result.current;

      expect(range).toEqual({ min: 50, max: 100 });
      expect(nextSearch).toBe('min=50');
      expect(history.location.search).toBe('?min=50');
    });

    it('should delete params when undefined is explicitly passed even if the "incrementally" flag is set to true', () => {
      const { result } = renderHook(() => useFilter(rangeFilter), { wrapper });

      let nextSearch;

      act(() => {
        history.push({ search: 'min=100&max=200' });
        const [, setRange] = result.current;
        nextSearch = setRange({ min: 50, max: undefined }, { incrementally: true });
      });

      const [range] = result.current;

      expect(range).toEqual({ min: 50, max: 100 });
      expect(nextSearch).toBe('min=50');
      expect(history.location.search).toBe('?min=50');
    });

    it('should return undefined if the values together are invalid', () => {
      const { result } = renderHook(() => useFilter(rangeFilter), { wrapper });

      let nextSearch;

      act(() => {
        history.push({ search: 'min=100&max=50' });
      });

      const [range] = result.current;
      expect(range).toBeUndefined();
    });
  });

  describe('performance', () => {
    let ConsumerComponent;
    let Wrapper;
    
    beforeEach(() => {
      Wrapper = wrapper;
      ConsumerComponent = jest.fn().mockImplementation(() => {
        const [foo] = useFilter('foo');
        return null;
      });
    });

    test('useFilter should cause the consumer component to rerender when critical values change (control group)', () => {
      render(
        <Wrapper>
          <ConsumerComponent />
        </Wrapper>
      );

      reactTestingLibraryAct(() => {
        history.push({ search: 'foo=bar' });
      });

      expect(ConsumerComponent).toHaveBeenCalledTimes(2);
    });

    test('useFilter should not cause the consumer component to rerender when irrelevant values change', () => {
      render(
        <Wrapper>
          <ConsumerComponent />
        </Wrapper>
      );

      reactTestingLibraryAct(() => {
        history.push({ search: 'bar=foo' });
      });

      expect(ConsumerComponent).toHaveBeenCalledTimes(1);
    });
  });

  it('should specify a proper hook debug value', () => {
    const useDebugValue = jest.spyOn(React, 'useDebugValue');
    history.push({ search: 'foo=bar' });
    renderHook(() => useFilter<string>('foo'), { wrapper });
    
    const debugCallback = useDebugValue.mock.calls[0][1];
    expect(useDebugValue).toHaveBeenCalledWith('useFilter', expect.any(Function));
    // @ts-ignore
    expect(debugCallback()).toBe('foo');
  });
});