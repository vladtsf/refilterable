import { createFilter, composeFilters } from '../src';
import { isFilterObject, isFilterComposition } from '../src/utils/types';

describe('composeFilters', () => {
  const minFilter = createFilter('min', { 
    parse: parseInt,
    defaultValue: '0',
  });
  
  const maxFilter = createFilter('max', { 
    parse: parseInt,
    defaultValue: '100',
  });

  it('should not work if no filters are passed', () => {
    expect(() => {
      // @ts-ignore
      composeFilters()
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      composeFilters([])
    }).toThrowErrorMatchingSnapshot();
  });

  it('should refuse to work with object literals', () => {
    expect(() => {
      // @ts-ignore
      composeFilters([{}])
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      // @ts-ignore
      composeFilters([minFilter, {}])
    }).toThrowErrorMatchingSnapshot();
  });

  it('should return an objet of type FilterComposition', () => {
    const composition = composeFilters([minFilter, maxFilter]);
    expect(isFilterComposition(composition)).toBe(true);
  });

  it('should return accept and pass forward custom validation functions', () => {
    const validate = jest.fn().mockReturnValue(false);
    const composition = composeFilters([minFilter, maxFilter], validate);
    composition.validate({ min: 10, max: 20 });
    expect(validate).toHaveBeenCalledWith({ min: 10, max: 20 });
  });

  test('default validation function should always return true', () => {
    const composition = composeFilters([minFilter, maxFilter]);
    expect(composition.validate({ min: 10, max: 20 })).toBe(true);
    expect(composition.validate({ min: 20, max: 10 })).toBe(true);
  })
});