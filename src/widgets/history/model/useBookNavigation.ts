import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import type { Breakpoint } from '@shared/lib/breakpoint/useBreakpoint';

import { INDEX_LIST } from './constants';
import { getPageRegistry } from './pageRegistry';
import type { IndexItem } from './types';

const FLIP_DURATION = 800;

export function useBookNavigation(breakpoint: Breakpoint) {
  const pageRegistry = getPageRegistry(breakpoint);

  const [activeItem, setActiveItem] = useState<IndexItem>('List');
  const [pageIndices, setPageIndices] = useState<Record<IndexItem, number>>(
    () =>
      Object.fromEntries(INDEX_LIST.map((item) => [item, 0])) as Record<
        IndexItem,
        number
      >,
  );
  const [flipDirection, setFlipDirection] = useState<
    'forward' | 'backward' | null
  >(null);
  const [isFlipping, setIsFlipping] = useState(false);

  const activeIndex = INDEX_LIST.indexOf(activeItem);
  const rawPageIndex = pageIndices[activeItem];
  const totalPages = pageRegistry[activeItem].totalPages;
  const currentPageIndex = Math.min(rawPageIndex, totalPages - 1);

  const canGoLeft = activeIndex > 0 || currentPageIndex > 0;
  const canGoRight =
    activeIndex < INDEX_LIST.length - 1 || currentPageIndex < totalPages - 1;

  const isAnimatingRef = useRef(false);
  const pendingNavRef = useRef<(() => void) | null>(null);
  const holdDirectionRef = useRef<'left' | 'right' | null>(null);
  const flipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chainTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goLeftRef = useRef<() => void>(() => {});
  const goRightRef = useRef<() => void>(() => {});
  const stopHoldRef = useRef<() => void>(() => {});

  // 다음 페이지 계산 (forward)
  let nextPageIndex = currentPageIndex;
  let nextActiveItem: IndexItem = activeItem;
  if (currentPageIndex < totalPages - 1) {
    nextPageIndex = currentPageIndex + 1;
    nextActiveItem = activeItem;
  } else if (activeIndex < INDEX_LIST.length - 1) {
    nextActiveItem = INDEX_LIST[activeIndex + 1];
    nextPageIndex = 0;
  }

  // 이전 페이지 계산 (backward)
  let prevPageIndex = currentPageIndex;
  let prevActiveItem: IndexItem = activeItem;
  if (currentPageIndex > 0) {
    prevPageIndex = currentPageIndex - 1;
    prevActiveItem = activeItem;
  } else if (activeIndex > 0) {
    prevActiveItem = INDEX_LIST[activeIndex - 1];
    prevPageIndex = pageRegistry[prevActiveItem].totalPages - 1;
  }

  function completeFlip() {
    if (!isAnimatingRef.current) return;

    const nav = pendingNavRef.current;
    pendingNavRef.current = null;

    // flushSync로 리셋 렌더를 동기적으로 커밋
    // React auto-batching이 isFlipping false→true를 병합하는 것을 방지
    flushSync(() => {
      if (nav) nav();
      setFlipDirection(null);
      setIsFlipping(false);
    });

    isAnimatingRef.current = false;

    // Hold 중이면 다음 플립 체이닝
    if (holdDirectionRef.current) {
      chainTimerRef.current = setTimeout(() => {
        if (holdDirectionRef.current === 'left') goLeftRef.current();
        else if (holdDirectionRef.current === 'right') goRightRef.current();
      }, 0);
    }
  }

  function triggerFlip(direction: 'forward' | 'backward', nav: () => void) {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    pendingNavRef.current = nav;
    setFlipDirection(direction);
    setIsFlipping(true);

    // CSS transition과 동일한 duration 후 완료
    flipTimerRef.current = setTimeout(completeFlip, FLIP_DURATION);
  }

  function goLeft() {
    if (!canGoLeft) {
      holdDirectionRef.current = null;
      return;
    }
    triggerFlip('backward', () => {
      if (currentPageIndex > 0) {
        setPageIndices((prev) => ({
          ...prev,
          [activeItem]: prev[activeItem] - 1,
        }));
      } else if (activeIndex > 0) {
        const prev = INDEX_LIST[activeIndex - 1];
        const prevTotalPages = pageRegistry[prev].totalPages;
        setPageIndices((p) => ({ ...p, [prev]: prevTotalPages - 1 }));
        setActiveItem(prev);
      }
    });
  }

  function goRight() {
    if (!canGoRight) {
      holdDirectionRef.current = null;
      return;
    }
    triggerFlip('forward', () => {
      if (currentPageIndex < totalPages - 1) {
        setPageIndices((prev) => ({
          ...prev,
          [activeItem]: prev[activeItem] + 1,
        }));
      } else if (activeIndex < INDEX_LIST.length - 1) {
        const next = INDEX_LIST[activeIndex + 1];
        setPageIndices((p) => ({ ...p, [next]: 0 }));
        setActiveItem(next);
      }
    });
  }

  function goToItem(item: IndexItem, pageIndex = 0) {
    const newIndex = INDEX_LIST.indexOf(item);
    if (newIndex === activeIndex && pageIndex === currentPageIndex) return;
    const direction = newIndex >= activeIndex ? 'forward' : 'backward';
    triggerFlip(direction, () => {
      setPageIndices((prev) => ({ ...prev, [item]: pageIndex }));
      setActiveItem(item);
    });
  }

  function startHold(direction: 'left' | 'right') {
    holdDirectionRef.current = direction;
    if (direction === 'left') goLeftRef.current();
    else goRightRef.current();
  }

  function stopHold() {
    holdDirectionRef.current = null;
    if (chainTimerRef.current) {
      clearTimeout(chainTimerRef.current);
      chainTimerRef.current = null;
    }
  }

  // 매 렌더 후 최신 함수 반영
  useEffect(() => {
    goLeftRef.current = goLeft;
    goRightRef.current = goRight;
    stopHoldRef.current = stopHold;
  });

  // 마우스: window-level mouseup
  useEffect(() => {
    function handleMouseUp() {
      stopHoldRef.current();
    }
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // 키보드
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.repeat) return;
      if (e.key === 'ArrowLeft') {
        holdDirectionRef.current = 'left';
        goLeftRef.current();
      } else if (e.key === 'ArrowRight') {
        holdDirectionRef.current = 'right';
        goRightRef.current();
      }
    }
    function handleKeyUp(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft' && holdDirectionRef.current === 'left')
        stopHoldRef.current();
      else if (e.key === 'ArrowRight' && holdDirectionRef.current === 'right')
        stopHoldRef.current();
    }
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // 클린업
  useEffect(() => {
    return () => {
      if (flipTimerRef.current) clearTimeout(flipTimerRef.current);
      if (chainTimerRef.current) clearTimeout(chainTimerRef.current);
    };
  }, []);

  return {
    activeItem,
    currentPageIndex,
    canGoLeft,
    canGoRight,
    isFlipping,
    flipDirection,
    nextPageIndex,
    nextActiveItem,
    prevPageIndex,
    prevActiveItem,
    goToItem,
    startHold,
  };
}
