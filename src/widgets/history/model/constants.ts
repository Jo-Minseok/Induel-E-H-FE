import artworks from '../asset/data/artwork.json';
import type { IndexItem, PageSide } from './types';

export const CONTENT_TOTAL_PAGES = Math.ceil(artworks.length / 2);

const AWARD_YEAR_RANGES = [
  [2003, 2007],
  [2008, 2011],
  [2012, 2015],
  [2016, 2019],
] as const;

export const AWARD_PAGES = AWARD_YEAR_RANGES.length;
export const AWARD_TOTAL_PAGES = Math.ceil(AWARD_PAGES / 2);
export { AWARD_YEAR_RANGES };

export const INDEX_LIST: readonly IndexItem[] = [
  'List',
  'Content',
  'Timeline',
  'Award',
];

export const PAGE_SIDE: { readonly LEFT: PageSide; readonly RIGHT: PageSide } =
  {
    LEFT: 'left',
    RIGHT: 'right',
  };
