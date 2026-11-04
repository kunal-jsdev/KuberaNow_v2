import { SmallContentCard } from './SmallContentCard';
import type { CardWrapperProps } from './types';

export function CardWrapper({ cards = [] }: CardWrapperProps) {
  const validCards = cards.filter((card) => card.image || card.headline);

  if (validCards.length === 0) {
    return null;
  }

  return (
    <div className='sm:border-career-stroke ring-career-stroke grid grid-cols-2 gap-3.75 rounded-md bg-white p-3 ring sm:gap-5 sm:border sm:p-5 sm:ring-0 lg:grid-cols-4'>
      {validCards.map((card) => (
        <SmallContentCard
          key={card.id}
          {...card}
        />
      ))}
    </div>
  );
}
