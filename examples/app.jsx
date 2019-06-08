import React from 'react';
import { render } from 'react-dom';
import { FiltersProvider, useFilter, createFilter, composeFilters } from '..'; // import { FiltersProvider } from 're-filter';
import { createBrowserHistory } from 'history';

import RenderCounter from './RenderCounter';
import LastClickTimeButton from './LastClickTimeButton';
import Pagination from './Pagination';
import ResetButton from './ResetButton';
import RandomNumber from './RandomNumber';
import Range from './Range';

const history = createBrowserHistory();
window.appHistory = history;

function App() {
  return (
    <FiltersProvider history={history}>
      <RenderCounter />
      <Pagination />
      <LastClickTimeButton />
      <RandomNumber />
      <ResetButton />
      <Range />
    </FiltersProvider>
  );
}

render(<App />, document.getElementById('app'));
