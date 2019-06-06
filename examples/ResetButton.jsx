import React from 'react';
import { useReset } from "..";
import RenderCounter from './RenderCounter';

export default function ResetButton() {
  const reset = useReset();

  return (
    <div>
      <RenderCounter />
      <button type="reset" onClick={() => reset()}>Reset filters</button>
    </div>
  );
}