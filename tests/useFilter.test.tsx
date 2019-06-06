import React from 'react';
import { History } from 'history';
import { renderHook, act } from 'react-hooks-testing-library'
import { useFilter, FiltersProvider, createFilter } from '../src';
import { createMemoryHistory, createBrowserHistory } from 'history';

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
        history.push({ search: '?foo=bar' })
        renderHook(() => useFilter(filter), { wrapper }).result.current;
        expect(parse).toHaveBeenCalledWith('bar');
      });
  
      it('should not call the parse method when the filter is not specified', () => {
        history.push({ search: '?' })
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

      it('should not change the url if the "dry" options is set to true', () => {
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

});