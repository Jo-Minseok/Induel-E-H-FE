import awardData from '../asset/data/award.json';
import { AWARD_YEAR_RANGES } from '../model/constants';
import type { PageSide } from '../model/types';
import '../style/Award.css';

function getItemsByRange(start: number, end: number) {
  return awardData.filter((item) => item.year >= start && item.year <= end);
}

const pages = AWARD_YEAR_RANGES.map(([start, end]) =>
  getItemsByRange(start, end),
);

export function AwardPage({
  side,
  pageIndex,
}: {
  side: PageSide;
  pageIndex: number;
}) {
  const dataIndex = pageIndex * 2 + (side === 'left' ? 0 : 1);
  const items = pages[dataIndex] ?? [];
  const showTitle = dataIndex === 0;

  return (
    <div className='award__container'>
      {showTitle && (
        <div className='award__title'>
          <hr />
          <h3>Award</h3>
          <hr />
        </div>
      )}
      <div className='award__content'>
        {items.map((group) => (
          <div key={group.year} className='award__year-group'>
            <span className='award__year'>{group.year}</span>
            <ul className='award__ul'>
              {group.contents.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
