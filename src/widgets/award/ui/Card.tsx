import type { AwardItem } from '@entities/award';

import { getAwardImage } from '../model/helper';
import '../styles/Card.css';

export function Card({ award }: { award: AwardItem }) {
  return (
    <div className='award__card'>
      <div className='award__card_image'>
        <img src={getAwardImage(award.id)} alt={award.title} loading='lazy' />
      </div>
      <div className='award__card_content'>
        <div className='award__card_text'>
          <p className='award__card_category'>{award.category}</p>
          <h4 className='award__card_title'>{award.title}</h4>
        </div>
        <p className='award__card_year'>{award.date.slice(0, 4)}</p>
      </div>
    </div>
  );
}
