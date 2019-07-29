import { createFilter } from '../src';
import { isFilterObject } from '../src/utils/types';


describe('createFilter', () => {
  it('should throw an error if the param name is not specified', () => {
    expect(() => {
      // @ts-ignore
      createFilter();
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      // @ts-ignore
      createFilter('');
    }).toThrowErrorMatchingSnapshot();
  });

  it('should pass the url param name to the configuration', () => {
    expect(createFilter('foo').paramName).toBe('foo');
  });

  it('should provide default parse, format, and validate methods', () => {
    const filter = createFilter('foo');

    expect(filter.parse('foo')).toBe('foo');
    expect(filter.format(123)).toBe('123');
    expect(filter.validate('foo', filter.parse)).toBe(true);
  });

  test('resetValue should fall back to defaultValue', () => {
    const filter = createFilter('foo', { defaultValue: "bar" });

    expect(filter.resetValue).toBe(filter.defaultValue);
    expect(filter.resetValue).toBe("bar");
  });

  it('should allow the user to override parse, format, and validate methods', () => {
    const parse = jest.fn();
    const format = jest.fn();
    const validate = jest.fn().mockImplementation((input, parse) => parse(input) && true);
    const filter = createFilter('foo', { parse, format, validate });

    filter.parse('foo');
    expect(parse).toHaveBeenCalledWith('foo');
    filter.format(123);
    expect(format).toHaveBeenCalledWith(123);
    filter.validate('foo', parse);
    expect(validate).toHaveBeenCalledWith('foo', parse);
    expect(parse).toHaveBeenLastCalledWith('foo');
  });

  it('should add a symbol specifying that the filter configuration was created using createFilter', () => {
    const filterObject = createFilter('foo');
    const notFilterObject = JSON.parse(JSON.stringify(filterObject));
    expect(isFilterObject(filterObject)).toBe(true);
    expect(isFilterObject(notFilterObject)).toBe(false);
  });
});
