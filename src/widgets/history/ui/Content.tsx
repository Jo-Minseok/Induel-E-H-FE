import { artworks } from '@entities/history';

import { getDataIndex } from '../model/helpers';
import type { PageSide } from '../model/types';
import '../styles/Content.css';

const contentImages = import.meta.glob('../assets/content/*.webp', {
  eager: true,
  import: 'default',
});

function getContentImage(index: number): string | undefined {
  const src = contentImages[`../assets/content/${index}.webp`];
  return typeof src === 'string' ? src : undefined;
}

interface ContentPageProps {
  side: PageSide;
  pageIndex: number;
}

type SubTitleProp = string | string[] | undefined;
type ContentProp = string | string[];

function SubTitleContent({
  subTitle,
  content,
}: {
  subTitle: SubTitleProp;
  content: ContentProp;
}) {
  if (Array.isArray(subTitle)) {
    return subTitle.map((sub, i) => (
      <div key={sub} className='content__text-group'>
        <h4 className='content__subtitle'>{sub}</h4>
        {Array.isArray(content) && content[i] && (
          <p className='content__body'>{content[i]}</p>
        )}
      </div>
    ));
  }

  return (
    <div className='content__text-group'>
      {subTitle && <h4 className='content__subtitle'>{subTitle}</h4>}
      {typeof content === 'string' && content && (
        <p className='content__body'>{content}</p>
      )}
    </div>
  );
}

function ContentItem({
  item,
  index,
}: {
  item: (typeof artworks)[0];
  index: number;
}) {
  const imageSrc = getContentImage(index);

  return (
    <article className='content__item'>
      <div className='content__text'>
        <h3 className='content__title-eng'>{item.titleEng}</h3>
        <h3 className='content__title-kor'>{item.title}</h3>
        <SubTitleContent
          subTitle={item.subTitle as SubTitleProp}
          content={item.content as ContentProp}
        />
        <dl className='content__caption'>
          <div className='content__caption-col'>
            {item.time && (
              <div className='content__caption-row'>
                <dt>사업 기간</dt>
                <dd>{item.time}</dd>
              </div>
            )}
            {item.area.length > 0 && (
              <div className='content__caption-row'>
                <dt>사업 면적</dt>
                <dd>{item.area.join('\n')}</dd>
              </div>
            )}
          </div>
          <div className='content__caption-col'>
            {item.description && (
              <div className='content__caption-row'>
                <dt className='sr-only'>설명</dt>
                <dd>{item.description}</dd>
              </div>
            )}
            {item.address && (
              <div className='content__caption-row'>
                <dt className='sr-only'>주소</dt>
                <dd>{item.address}</dd>
              </div>
            )}
          </div>
        </dl>
      </div>
      <figure className='content__image'>
        {imageSrc && <img src={imageSrc} alt={item.title} />}
      </figure>
    </article>
  );
}

export function ContentPage({ side, pageIndex }: ContentPageProps) {
  const itemIndex = getDataIndex(pageIndex, side);
  const item = artworks[itemIndex] ?? null;

  return item ? (
    <ContentItem item={item} index={itemIndex} />
  ) : (
    <div className='content__empty' />
  );
}
