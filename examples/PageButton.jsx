import React from 'react';
import { useFilter } from '..'; // import { useFilter } from 'refilterable';
import { pageFilter } from './filters';

export default function PageButton({ pageNumber }) {
  const [page, setPage] = useFilter(pageFilter);

  return (
    <button onClick={() => setPage(pageNumber)}>
      {pageNumber}
    </button>
  )
}