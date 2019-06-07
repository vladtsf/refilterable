import React from 'react';
import { useFilter } from '../'; // import { useFilter } from 're-filter';
import RenderCounter from './RenderCounter';
import { minFilter, maxFilter, rangeFilter } from './filters';

export default function Range() {
  const [min, setMin] = useFilter(minFilter);
  const [max, setMax] = useFilter(maxFilter);
  const [range, setRange] = useFilter(rangeFilter);

  return (
    <div>
      <RenderCounter />
      <br />
      Range: {range ? JSON.stringify(range) : 'Invalid range'}
      <br />
      <button onClick={() => setRange({ min: 0, max: 25 })}>set: 0-25</button>
      <button onClick={() => setRange({ min: 25, max: 50 })}>set: 25-50</button>
      <button onClick={() => setRange({ min: 50, max: 75 })}>set: 50-75</button>
      <button onClick={() => setRange({ min: 75, max: 100 })}>set: 75-100</button>
      <br />
      min: 
      <input 
        type="range" 
        min="1" 
        max="100" 
        value={min}
        onChange={({ target }) => setMin(target.value)} 
      />
      <br />
      max: 
      <input 
        type="range" 
        min="1" 
        max="100" 
        value={max}
        onChange={({ target }) => setMax(target.value)} 
      />
    </div>
  )
}