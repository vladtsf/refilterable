import React from 'react';
import { useFilter } from '../'; // import { useFilter } from 'refilterable';
import { pageFilter } from './filters';
import RenderCounter from './RenderCounter';
import LastClickTimeButton from './LastClickTimeButton';
import PageButton from './PageButton';


export default function Pagination() {
  const [page] = useFilter(pageFilter);

  return (
    <div>
      <RenderCounter />
      <br />
      Current Page: {page}
      <br />
      <PageButton pageNumber={1} />
      <PageButton pageNumber={2} />
      <PageButton pageNumber={3} />
      <PageButton pageNumber={4} />
      <LastClickTimeButton />
    </div>
  );
}