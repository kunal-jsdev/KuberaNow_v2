// Leadership page content, sourced from the "Leadership" data sheet.
// Images live in /public/leadership-assets.

const ASSET_BASE = '/leadership-assets';

export type Leader = {
  id: string;
  name: string;
  designation: string;
  experience: string;
  description: string;
  image: string | null;
};

export type HeadOfDepartment = {
  id: string;
  name: string;
  designation: string;
  description: string;
  image: string;
};

export type TeamMember = {
  id: string;
  name: string;
  image: string;
};

export const LEADERSHIP_PATH = '/leadership-team';

export const LEADERSHIP_KEYWORDS = [
  'KuberaNow leadership team',
  'editorial leaders',
  'journalists Gujarat',
  'business news team',
  'KuberaNow media',
];

/** Name / description used for the AboutPage node in the page's JSON-LD. */
export const LEADERSHIP_JSON_LD = {
  name: 'Leadership Team | KuberaNow',
  breadcrumbName: 'Leadership Team',
  description:
    "Meet the executive leadership, editors, and advisory team behind KuberaNow, Gujarat's premier business and financial news platform.",
};

export const LEADERS: Leader[] = [
  {
    id: 'monil-vora',
    name: 'Monil Vora',
    designation: 'Chairman & Managing Director',
    experience: '22+',
    description: 'years in investment advisory and financial services',
    image: `${ASSET_BASE}/leaders/monil-vora.webp`,
  },
  {
    id: 'nirav-purohit',
    name: 'Nirav Purohit',
    designation: 'CEO',
    experience: '25+',
    description:
      "years of leadership in India's regional infotainment and news media.",
    image: `${ASSET_BASE}/leaders/nirav-purohit.webp`,
  },
];

export const HEADS_OF_DEPARTMENT: HeadOfDepartment[] = [
  {
    id: 'satish-papnai',
    name: 'Satish Papnai',
    designation: 'Director',
    description:
      '25+ Years in Channel Distribution, Audience Growth & Market Expansion',
    image: `${ASSET_BASE}/hod/satish-papnai.webp`,
  },
  {
    id: 'divyesh-nagar',
    name: 'Divyesh Nagar',
    designation: 'Editor',
    description: '24+ Years in Journalism, Media Strategy & Team Leadership',
    image: `${ASSET_BASE}/hod/divyesh-nagar.webp`,
  },
  {
    id: 'mitesh-bhavsar',
    name: 'Mitesh Bhavsar',
    designation: 'Chief Manager of Finance & Operations',
    description: '25+ Years in Financial Management Across Industries',
    image: `${ASSET_BASE}/hod/mitesh-bhavsar.webp`,
  },
  {
    id: 'hitesh-desai',
    name: 'Hitesh Desai',
    designation: 'Head - Broadcast & Technical - IT Operations',
    description: '20+ Years in Broadcast Technology & PCR Operations',
    image: `${ASSET_BASE}/hod/hitesh-desai.webp`,
  },
  {
    id: 'mukesh-sharma',
    name: 'Mukesh Sharma',
    designation: 'Head Camera',
    description: '30+ Years in Regional, National & International Broadcasting',
    image: `${ASSET_BASE}/hod/mukesh-sharma.webp`,
  },
  {
    id: 'krutarth-dalal',
    name: 'Krutarth Dalal',
    designation: 'Head of Product & Strategy',
    description: '16+ Years in Digital Media, Product Innovation & Fintech',
    image: `${ASSET_BASE}/hod/krutarth-dalal.webp`,
  },
  {
    id: 'kajol-charania',
    name: 'Kajol Charania',
    designation: 'Marketing Head',
    description: '8+ Years in Marketing, IP Creation, Product Branding',
    image: `${ASSET_BASE}/hod/kajol-charania.webp`,
  },
  {
    id: 'vijay-parmar',
    name: 'Vijay Parmar',
    designation: 'Associate Editor',
    description: '20+ Years in Business Journalism & Media Brand Building',
    image: `${ASSET_BASE}/hod/vijay-parmar.webp`,
  },
  {
    id: 'ravi-pradhan',
    name: 'Ravi Pradhan',
    designation: 'Video Editor - HOD',
    description:
      '20+ Years in Broadcast Media, Creative Direction & Visual Storytelling',
    image: `${ASSET_BASE}/hod/ravi-pradhan.webp`,
  },
  {
    id: 'haresh-kanzariya',
    name: 'Haresh Kanzariya',
    designation: 'Producer',
    description:
      '14+ Years in Digital Journalism, Content Strategy & Editorial Leadership',
    image: `${ASSET_BASE}/hod/haresh-kanzariya.webp`,
  },
];

const teamMember = (id: string, name: string): TeamMember => ({
  id,
  name,
  image: `${ASSET_BASE}/team/${id}.webp`,
});

export const TEAM_MEMBERS: TeamMember[] = [
  teamMember('yogesh-yadav', 'Yogesh Yadav'),
  teamMember('rajan-vadodaria', 'Rajan Vadodaria'),
  teamMember('sumedh-desai', 'Sumedh Desai'),
  teamMember('krishna-prajapati', 'Krishna Prajapati'),
  teamMember('krimil-hariya', 'Krimil Hariya'),
  teamMember('prutha-paghdal', 'Prutha Paghdal'),
  teamMember('himanshu-panchal', 'Himanshu Panchal'),
  teamMember('hiren-jani', 'Hiren Jani'),
  teamMember('vishal-jani', 'Vishal Jani'),
  teamMember('rahul-salodiya', 'Rahul Salodiya'),
  teamMember('shreenivas-pengonda', 'Shreenivas Pengonda'),
  teamMember('dhaval-bhatti', 'Dhaval Bhatti'),
  teamMember('samir-desai', 'Samir Desai'),
  teamMember('komal-patel', 'Komal Patel'),
  teamMember('rahul-talreja', 'Rahul Talreja'),
  teamMember('rahul-varotariya', 'Rahul Varotariya'),
  teamMember('nirav-patel', 'Nirav Patel'),
  teamMember('dhruv-patel', 'Dhruv Patel'),
  teamMember('kirtan-sakhalva', 'Kirtan Sakhalva'),
  teamMember('zankhana-pankhaniya', 'Zankhana Pankhaniya'),
  teamMember('dipika-rathod', 'Dipika Rathod'),
  teamMember('yug-parmar', 'Yug Parmar'),
  teamMember('rohitsingh-negi', 'Rohitsingh Negi'),
  teamMember('jainik-suthar', 'Jainik Suthar'),
];

export const TEAM_LOGO = `${ASSET_BASE}/team-kubera-logo.svg`;

/**
 * Team orbit geometry, in Figma frame pixels. Each ring is a dashed arc the
 * avatars travel along; the frame clips the lower half.
 *
 * spacing — degrees between neighbouring avatars on a ring; it sets how many
 * are on screen at once (~5 on the outer and inner rings).
 * duration — seconds for an avatar to travel 210° (sets the speed).
 * fixedAvatar — keep avatars at exactly `avatar` px instead of scaling them
 * with the section width.
 */
export const TEAM_ORBIT_LAYOUTS = {
  desktop: {
    width: 950,
    height: 559,
    avatar: 80,
    fixedAvatar: false,
    logo: { width: 148, height: 50, bottom: 20 },
    rings: [
      {
        diameter: 1200,
        centerX: 474,
        centerY: 649.5,
        duration: 72,
        spacing: 21,
        arc: `${ASSET_BASE}/arc-1200.png`,
      },
      {
        diameter: 900,
        centerX: 474,
        centerY: 651.5,
        duration: 54,
        spacing: 26.25,
        arc: `${ASSET_BASE}/arc-900.png`,
      },
      {
        diameter: 600,
        centerX: 474,
        centerY: 651.5,
        duration: 36,
        spacing: 28,
        arc: `${ASSET_BASE}/arc-600.png`,
      },
    ],
  },
  mobile: {
    width: 343,
    height: 246,
    avatar: 30,
    fixedAvatar: true,
    logo: { width: 88, height: 30, bottom: 5 },
    rings: [
      {
        diameter: 450,
        centerX: 172,
        centerY: 257,
        duration: 72,
        spacing: 20,
        arc: `${ASSET_BASE}/arc-mobile-450.png`,
      },
      {
        diameter: 350,
        centerX: 172,
        centerY: 279,
        duration: 54,
        spacing: 26.25,
        arc: `${ASSET_BASE}/arc-mobile-350.png`,
      },
      {
        diameter: 280,
        centerX: 172,
        centerY: 314,
        duration: 36,
        spacing: 24.4,
        arc: `${ASSET_BASE}/arc-mobile-280.png`,
      },
    ],
  },
} as const;
