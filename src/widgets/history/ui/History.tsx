import { Fragment, useState } from 'react';

import type { PageSide } from '../model/types';
import '../style/History.css';
import '../style/HistoryBook.css';
import { AwardPage } from './Award';
import { ContentPage } from './Content';
import { HistoryPage } from './HistoryPage';
import { ListPage } from './List';

function BookPageOuterShadow({ side }: { side: PageSide }) {
  const levels = side === 'left' ? [3, 2, 1] : [1, 2, 3];
  return (
    <div className='history__book-page-outer-shadow'>
      {levels.map((level) => (
        <div
          key={level}
          className={`history__book-page-outer-shadow-${level}`}
        />
      ))}
    </div>
  );
}

function BookPage({
  side,
  children,
}: {
  side: PageSide;
  children?: React.ReactNode;
}) {
  return (
    <div className={`history__book-page-${side}`}>
      {side === 'left' ? (
        <>
          <BookPageOuterShadow side='left' />
          <div className='history__book-page-content'>{children}</div>
          <div className='history__book-page-inner-shadow' />
        </>
      ) : (
        <>
          <div className='history__book-page-inner-shadow' />
          <div className='history__book-page-content'>{children}</div>
          <BookPageOuterShadow side='right' />
        </>
      )}
    </div>
  );
}

function History() {
  const indexList = ['List', 'Content', 'History', 'Award'];
  const [activeItem, setActiveItem] = useState('List');
  return (
    <>
      <section className='history'>
        <h2 className='history__title'>History</h2>
        <div className='history__category' role='tablist'>
          {indexList.map((item, index) => (
            <Fragment key={item}>
              <button
                role='tab'
                aria-selected={activeItem === item}
                className={activeItem === item ? 'active' : ''}
                onClick={() => setActiveItem(item)}
              >
                {item}
              </button>
              {index < indexList.length - 1 && (
                <span aria-hidden='true'>|</span>
              )}
            </Fragment>
          ))}
        </div>
        <div className='history__book'>
          <div className='history__book-page'>
            <BookPage side='left'>
              {activeItem === 'List' && <ListPage side='left' />}
              {activeItem === 'Content' && <ContentPage side='left' />}
              {activeItem === 'History' && <HistoryPage side='left' />}
              {activeItem === 'Award' && <AwardPage side='left' />}
            </BookPage>
            <BookPage side='right'>
              {activeItem === 'List' && <ListPage side='right' />}
              {activeItem === 'Content' && <ContentPage side='right' />}
              {activeItem === 'History' && <HistoryPage side='right' />}
              {activeItem === 'Award' && <AwardPage side='right' />}
            </BookPage>
          </div>
          <div className='history__book-cover'>
            <div className='history__book-cover-left'></div>
            <div className='history__book-cover-center'>
              <div className='history__book-cover-center-line'>
                <div className='history__book-cover-center-line-top'></div>
                <div className='history__book-cover-center-line-bottom'></div>
              </div>
              <div className='history__book-cover-center-spine'>
                <div className='history__book-cover-center-spine-left'></div>
                <div className='history__book-cover-center-spine-center'></div>
                <div className='history__book-cover-center-spine-right'></div>
              </div>
            </div>
            <div className='history__book-cover-right'></div>
          </div>
        </div>
        <div className='history__last'>
          <p>공간을 문화로 창조하는 기업</p>
        </div>
      </section>
    </>
  );
}

export default History;
