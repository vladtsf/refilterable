import React from 'react';
import { render } from 'react-dom';
import { FiltersProvider } from '..';
import { createBrowserHistory } from 'history';

import RenderCounter from './RenderCounter';
import LastClickTimeButton from './LastClickTimeButton';
import Pagination from './Pagination';
import ResetButton from './ResetButton';
import RandomNumber from './RandomNumber';

const history = createBrowserHistory();

function App() {
  return (
    <FiltersProvider history={history}>
      <RenderCounter />
      <Pagination />
      <LastClickTimeButton />
      <RandomNumber />
      <ResetButton />
    </FiltersProvider>
  );
}

render(<App />, document.getElementById('app'));
