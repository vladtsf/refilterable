import React from 'react';
import { useFilter } from '../'; // import { useFilter } from 're-filter';
import RenderCounter from './RenderCounter';


export default function RandomNumber() {
  const [number, setNumber] = useFilter('random.number');

  return (
    <div>
      <RenderCounter />
      <br />
      Current random number: {number}
      <br />
      <button onClick={() => setNumber(Math.random())}>Randomize</button>
    </div>
  )
}