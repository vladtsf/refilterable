import { createFilter } from '..';

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