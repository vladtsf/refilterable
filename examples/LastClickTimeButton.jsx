import React from 'react';
import { useFilter } from '..'; // import { useFilter } from 're-filter';
import { lastClickFilter } from './filters';
import RenderCounter from './RenderCounter';


export default function LastClickTimeButton() {
  const [lastClick, setLastClick] = useFilter(lastClickFilter);

  return (
    <div>
      <RenderCounter />
      <br />
      Last Click: {lastClick.toString()}
      <br />
      <button onClick={() => setLastClick(Date.now())}>Update</button>
    </div>
  );
}