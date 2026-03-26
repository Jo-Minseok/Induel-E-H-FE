import { useCallback, useRef, useState } from 'react';

import { DEFAULT_COLUMNS } from './constant';

export function useGridLayout() {
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [rows, setRows] = useState(1);
  const observerRef = useRef<ResizeObserver | null>(null);

  const gridRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (!node) return;

    const el = node;

    function measure() {
      const style = getComputedStyle(el);
      const columnCount = style.gridTemplateColumns.split(' ').length;

      const viewport = el.parentElement?.parentElement;
      const firstCard = el.firstElementChild as HTMLElement | null;

      setColumns(columnCount);

      if (!viewport || !firstCard) return;

      const availableHeight = viewport.clientHeight;
      const cardHeight = firstCard.getBoundingClientRect().height;
      const rowGap = parseFloat(style.rowGap) || 0;

      if (cardHeight > 0 && availableHeight > 0) {
        setRows(
          Math.max(
            1,
            Math.floor((availableHeight + rowGap) / (cardHeight + rowGap)),
          ),
        );
      }
    }

    observerRef.current = new ResizeObserver(measure);
    observerRef.current.observe(el);

    const viewport = el.parentElement?.parentElement;
    if (viewport) observerRef.current.observe(viewport);
  }, []);

  return { gridRef, columns, rows };
}
