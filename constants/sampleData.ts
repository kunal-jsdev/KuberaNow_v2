import type {
  CarouselSlide as Slide,
  ContentImageProps,
  ContentImageSectionProps,
} from '@/components/main-page/types';
export const slides: Slide[] = [
  {
    id: 1,
    image:
      'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1600&q=80',
    headline:
      'Election Commission announces new digital voting guidelines for upcoming elections',
  },

  {
    id: 2,
    image:
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1600&q=80',
    headline:
      'Stock Market Live: Nifty crosses 23,600 mark as Banking stocks rally',
  },
  {
    id: 3,
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80',
    headline:
      'New AI infrastructure hub launched in India to foster tech startups',
  },
  {
    id: 4,
    type: 'video',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    headline:
      'New AI infrastructure hub launched in India to foster tech startups',
  },
  {
    id: 5,
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    headline:
      'Markets surge as global investors show renewed confidence in emerging economies',
  },
  {
    id: 6,
    type: 'youtube',
    url: 'https://youtu.be/b0I3vNm480M?si=SVLChVirhzLKVXJm',
    headline:
      'Markets surge as global investors show renewed confidence in emerging economies',
  },
];

export const heroSlides = slides;

export const featuredSectionData: ContentImageSectionProps = {
  mainArticle: {
    id: 1,
    image: 'https://picsum.photos/id/237/800/450',
    category: 'Market',
    headline:
      'સેન્સેક્સ ટુડે | સ્ટોક માર્કેટ LIVE અપડેટ: નિફ્ટી 23,600 ની સપાટીએ; ICICI બેંક ટોપ ગેઇનર, બેન્કિંગ ઈન્ડેક્સ રેકોર્ડ ઊંચાઈ પર',
    description:
      'ભારતીય શેરબજારે મંગળવારે સતત ચોથા સત્રમાં ઊંચાઈ નોંધાવી, કારણ કે ICICI બેંક અને HDFC બેંક જેવા હેવીવેઇટ્સની આગેવાનીમાં બેન્કિંગ સ્ટોક્સમાં તેજી જોવા મળી. નિફ્ટી 50 ઈન્ડેક્સ 23,600 ની માનસિક સપાટી પાર કરી ગયો, જ્યારે સેન્સેક્સ 78,200 ની નજીક પહોંચ્યો. વિદેશી સંસ્થાગત રોકાણકારો (FII) એ સતત, 78,200 ની નજીક પહોંચ્યો. વિદેશી સંસ્થાગત રોકાણકારો (FII) એ સતત...',
  },
  sideArticles: [
    {
      id: 2,
      image: 'https://picsum.photos/id/1015/400/250',
      category: 'Market',
      headline:
        'ચૂંટણી પંચે પશ્ચિમ બંગાળમાં 19 વરિષ્ઠ પોલીસ અધિકારીઓની મેનેજમેન્ટે ગાઈડન્સ સુધાર્યું',
    },
    {
      id: 3,
      image: 'https://picsum.photos/id/1060/400/250',
      category: 'Market',
      headline:
        'ચૂંટણી પંચે પશ્ચિમ બંગાળમાં 19 વરિષ્ઠ પોલીસ અધિકારીઓની મેનેજમેન્ટે ગાઈડન્સ સુધાર્યું',
    },
  ],
};

export const smallCardData: ContentImageProps[] = [
  {
    id: 1,
    image: 'https://picsum.photos/id/1015/400/250',
    category: 'Market',
    headline:
      'ચૂંટણી પંચે પશ્ચિમ બંગાળમાં 19 વરિષ્ઠ પોલીસ અધિકારીઓની મેનેજમેન્ટે ગાઈડન્સ સુધાર્યું',
  },
  {
    id: 2,
    image: 'https://picsum.photos/id/1060/400/250',
    category: 'Politics',
    headline: 'ગુજરાત વિધાનસભામાં નવા બિલને લઈને વિપક્ષે ઉગ્ર વિરોધ નોંધાવ્યો',
  },
  {
    id: 3,
    image: 'https://picsum.photos/id/1043/400/250',
    category: 'Business',
    headline:
      'શેરબજારમાં સતત બીજા દિવસે તેજી, સેન્સેક્સ 600 પોઇન્ટથી વધુ ઉછળ્યો',
  },
  {
    id: 4,
    image: 'https://picsum.photos/id/1035/400/250',
    category: 'Technology',
    headline:
      'ભારતમાં નવી AI ટેક્નોલોજી લોન્ચ થતાં સ્ટાર્ટઅપ્સ માટે નવી તકો ઉભી થઈ',
  },
  {
    id: 5,
    image: 'https://picsum.photos/id/1027/400/250',
    category: 'Sports',
    headline:
      'ભારતીય ક્રિકેટ ટીમે રોમાંચક મુકાબલામાં ઓસ્ટ્રેલિયાને હરાવી શ્રેણી જીતી',
  },
  {
    id: 6,
    image: 'https://picsum.photos/id/1050/400/250',
    category: 'Entertainment',
    headline:
      'નવી ગુજરાતી ફિલ્મે પ્રથમ જ સપ્તાહમાં બોક્સ ઓફિસ પર શાનદાર કમાણી કરી',
  },
  {
    id: 7,
    image: 'https://picsum.photos/id/1057/400/250',
    category: 'Health',
    headline:
      'રાજ્યમાં ડેન્ગ્યુના કેસોમાં વધારો, આરોગ્ય વિભાગે ખાસ માર્ગદર્શિકા જાહેર કરી',
  },
  {
    id: 8,
    image: 'https://picsum.photos/id/1068/400/250',
    category: 'World',
    headline:
      'આંતરરાષ્ટ્રીય સમિટમાં વૈશ્વિક અર્થતંત્ર અને જળવાયુ પરિવર્તન અંગે મહત્વપૂર્ણ ચર્ચા',
  },
];
