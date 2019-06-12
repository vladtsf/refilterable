<div align="center" markdown="1">

<h1>refilterable</h1>

<img src="https://user-images.githubusercontent.com/832496/59319154-7ea4ac80-8c7e-11e9-82d0-bbdeea3bb6d7.png" alt="refilterable" />

**"batteries-included" library to manage URL filters in React-based apps. Uses hooks**

</div>

## Table of Contents

- [The problem](#the-problem)
- [This solution](#this-solution)
- [Example](#example)
- [Installation](#installation)
- [LICENSE](#license)

## The problem

You want to have stable, reusable URL filters in your React app. As part of this goal, you want to make sure your existing URL filters are not impacted by your new solution. Ideally, you also want to standardize all your interaction with URL filters once and then just refer to existing patterns when you need to add a new filter. Next, you want to make sure you have access to certain filter from any component in your codebase. Plus, you want to make sure small changes in the URL don't cause the whole tree of React components to rerender. Finally, you want to be able to set filters both from your JavaScript code and `<a>` or react-router `<Link>` tags. All this has to be dead simple so you can focus on your app instead of reinventing the wheel.

## This solution

`refilterable` offers a simple two-step approach to the problem. You first define what URL parameters you're going to handle and then use a hook that gives allows you to access and mutate those parameters. You can also compose multiple filters into groups, which will allow you to batch mutations. The hook will cause your component to rerender only when the URL parameters relevant to the component change. It will also protect your component from values that are invalid – naturally you'll define what invalid means to you.

## Example

```jsx
// Range.jsx
import { createFilter, composeFilters, useFilter } from 'refilterable';

const minFilter = createFilter('min', {
  parse: (input) => parseInt(input),
  format: (value) => String(value),
  defaultValue: 0,
  validate: (input, parse) => parse(input) >= 0,
});

const maxFilter = createFilter('max', {
  parse: (input) => parseInt(input),
  format: (value) => String(value),
  defaultValue: 100,
  validate: (input, parse) => parse(input) >= 0,
});

const rangeFilter = composeFilters([min, max], ({ min, max }) => min <= max);

export function RangeInput() {
  const [min, setMin] = useFilter(minFilter);
  const [max, setMax] = useFilter(maxFilter);

  return (
    <div>
      Min: <input type="number" onChange={setMin()} />
      Max: <input type="number" onChange={setMax()} />
    </div>
  );
}

export function Range() {
  const [range, setRange] = useFilter(rangeFilter);

  return (
    <div>
      Min: {range.min}
      Max: {range.max}
      <button onClick={() => setRange({ min: 0, max: 100 })}>Set [0-100]</button>
    </div>
  );
}

// App.jsx
import { FiltersProvider, useReset } from 'refilterable';

const history = createBrowserHistory();

function App() {
  return (
    <FiltersProvider history={history}>
      <form>
        <RangeInput />
        <Range>
      </form>
    </FiltersProvider>
  );
}

```

## Installation

This module can be installed via `npm` or `yarn` and should be installed as one of your project's `dependencies`:

```
npm install --save refilterable
```

```
yarn add refilterable
```

This library has `peerDependencies` listings for `react` and `history`.
