import React from 'react';

export default function RenderCounter() {
  const count = React.useRef(1);

  return `Rendered ${count.current++} times`;
}
