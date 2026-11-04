type ParagraphBlock = {
  id: string;
  type: 'paragraph';
  text: string;
};

type BulletItem = {
  id: string;
  text: string;
};

type BulletBlock = {
  id: string;
  type: 'bullets';
  items: BulletItem[];
};

export type DisclaimerContentBlock = ParagraphBlock | BulletBlock;
export type ContentBlock = DisclaimerContentBlock;

export type DisclaimerSection = {
  id: string;
  number: number;
  title: string;
  content: DisclaimerContentBlock[];
};
