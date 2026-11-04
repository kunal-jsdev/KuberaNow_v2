export const CONTACT_INTRO =
  'We value every message from our viewers, readers, and business community members. Whether you have a news tip, a business inquiry, a complaint, or simply wish to connect with us, the KuberaNow team is here to assist you.';

export const CONTACT_RESPONSE_NOTICE =
  'We endeavour to respond to all inquiries within 48 business hours (Monday to Friday, 10:00 AM to 6:00 PM IST). Urgent editorial and grievance matters are prioritised.';

export const CONTACT_OFFICE = {
  company: 'KuberaNow Media Pvt. Ltd.',
  address:
    '3<sup>rd</sup> Floor, World Centre, Nr. Torrent Power, Ashram Road, Navrangpura, Ahmedabad, Gujarat 380009',
};

export const CONTACT_GENERAL = {
  email: 'info@kuberanow.com',
  phone: '+91 99042 77760',
  officeHours: ['Monday to Friday,', '10:00 AM – 6:00 PM IST'],
};

export const CONTACT_DEPARTMENTS = {
  news: {
    title: 'News & Story Suggestions',
    description:
      'Have a story that the Gujarati business community needs to know? All tips are reviewed by our editors and handled with confidentiality.',
    contacts: [
      { type: 'email' as const, value: 'editor@kuberanow.com' },
      { type: 'whatsapp' as const, value: '+91 93288 88771' },
    ],
    footnote:
      'Please note: Submitting a news tip does not guarantee publication. KuberaNow independently verifies all information before publishing.',
  },
  press: {
    title: 'Press & Media Inquiries',
    description:
      'For interview requests, official statements, media Promotion, and press-related matters:',
    contacts: [
      { type: 'email' as const, value: 'connect@kuberanow.com' },
      { type: 'whatsapp' as const, value: '+91 8160567228' },
    ],
    footnote:
      'Please note: Response Within 24 hours for critical issues; 48 hours for general queries',
  },
  technical: {
    title: 'Technical Support',
    description:
      'Experiencing difficulties with our website, app, live stream, or digital subscription? Our technical support team is available to assist:',
    contacts: [{ type: 'email' as const, value: 'it@kuberanow.com' }],
    footnote:
      'Please note: Response Within 24 hours for critical issues; 48 hours for general queries',
  },
};

export const CONTACT_ADVERTISING = {
  title: 'Advertising & Partnerships',
  description:
    'For advertising inquiries, branded content partnerships, sponsorship opportunities, and media kit requests, please contact our Business Development team:',
  email: CONTACT_GENERAL.email,
  phone: CONTACT_GENERAL.phone,
};

export const CONTACT_GRIEVANCE = {
  title: 'Grievance Officer',
  description:
    'In accordance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, and the Digital Personal Data Protection Act, 2023, KuberaNow has designated a Grievance Officer for complaints related to our content, editorial conduct, or personal data handling.',
  complaintNote:
    "Complaints must be submitted in writing (via email or post) and should include the complainant's name, contact details, a clear description of the grievance, and any supporting documentation.",
  officer: {
    name: 'Mitesh Bhavsar',
    role: 'Grievance Officer, KuberaNow',
    email: CONTACT_GENERAL.email,
    address:
      '3<sup>rd</sup> Floor, World Centre, Beside Dinesh Hall, Nr. Torrent Power, Ashram Road, Navrangpura, Ahmedabad, Gujarat – 380009',
  },
  sla: [
    { label: 'Acknowledgement', value: '48 Hrs', suffix: 'from receipt' },
    { label: 'Resolution', value: '15 Days', suffix: 'from receipt' },
  ],
};
