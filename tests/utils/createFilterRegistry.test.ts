import React from 'react';
import { History } from 'history';
import { render, act as reactTestingLibraryAct } from '@testing-library/react'
import { renderHook, act } from 'react-hooks-testing-library'
import { createMemoryHistory } from 'history';
import { useFilter, FiltersProvider, createFilter, composeFilters } from '../../src';
import createFilterRegistry from '../../src/utils/createFilterRegistry';
import { FilterRegistry, FilterObject } from '../../src/utils/types';

describe('utils/createFilterRegistry', () => {
  let filter: FilterObject, registry: FilterRegistry;

  beforeEach(() => {
    filter = createFilter('foo');
    registry = createFilterRegistry();
  });

  it('should allow you to add a filter uses', () => {
    registry.addFilterUse(filter);
    expect(registry.getAllFilters()).toContain(filter);
  });

  it('should delete filter if it is not used anymore', () => {
    registry.addFilterUse(filter);
    registry.deleteFilterUse(filter);
    expect(registry.getAllFilters()).not.toContain(filter);
  });

  it('should not delete a filter if someone is still using it', () => {
    registry.addFilterUse(filter);
    registry.addFilterUse(filter);
    registry.deleteFilterUse(filter);
    expect(registry.getAllFilters()).toContain(filter);
  });
});
