import type { ReactNode } from 'react';

export interface CategoryBadgeProps {
  category?: string;
  categorySlug?: string;
  children?: ReactNode;
  className?: string;
}

export interface HeadLineCardProps {
  src?: string;
  mediaType?: string;
  headline?: string;
  isActive?: boolean;
  priority?: boolean;
  isLive?: boolean;
  onClick?: () => void;
  onVideoPlayingChange?: (isPlaying: boolean) => void;
}

export interface ContentImageProps {
  id: string | number;
  image: string;
  headline: string;
  category: string;
  categorySlug?: string;
  link?: string;
  isLive?: boolean;
}

export interface CardWrapperProps {
  cards?: ContentImageProps[];
}

export interface Article {
  id: string | number;
  image: string;
  category: string;
  categorySlug?: string;
  headline: string;
  description?: string;
  link?: string;
  isLive?: boolean;
}

export interface ContentImageSectionProps {
  mainArticle: Article;
  sideArticles: Article[];
}

export interface CarouselSlide {
  id: number | string;
  url?: string;
  image?: string;
  type?: string;
  headline: string;
  link?: string;
  isLive?: boolean;
}

export interface CarouselProps {
  slides?: CarouselSlide[];
  autoPlayDelay?: number;
  showNavigation?: boolean;
  className?: string;
}

export interface CardSkeletonProps {
  count?: number;
  className?: string;
}
