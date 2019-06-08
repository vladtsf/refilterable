import { createFilter, composeFilters } from '..'; // import { createFilter } from 'refilterable';

export const pageFilter = createFilter('page', { 
  parse: (input) => parseInt(input), 
  format: (page) => String(page), 
  validate: (input, parse) => parse(input) >= 0,
  defaultValue: 0 
});

export const lastClickFilter = createFilter('last-click', { 
  parse: (input) => new Date(Number(input)), 
  format: (date) => String(Number(date)), 
  defaultValue: Date.now(),
});

export const minFilter = createFilter('min', { 
  parse: parseInt,
  defaultValue: '0',
});
export const maxFilter = createFilter('max', { 
  parse: parseInt,
  defaultValue: '100',
});

export const rangeFilter = composeFilters([
  minFilter, 
  maxFilter
], ({ min, max }) => min <= max);